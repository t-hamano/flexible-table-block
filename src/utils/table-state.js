/**
 * External dependencies
 */
import { times, mapValues, pick } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { isEmptyTableSection, isRangeSelected, isMultiSelected } from './helper';
import { convertToObject, convertToInline } from '../utils/style-converter';
import {
	updatePadding,
	updateBorderWidth,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderColor,
} from '../utils/style-updater';

/**
 * Creates a table state.
 *
 * @param {Object}  options
 * @param {number}  options.rowCount      Row count for the table to create.
 * @param {number}  options.colCount      Column count for the table to create.
 * @param {boolean} options.headerSection With/without header section.
 * @param {boolean} options.footerSection With/without footer section.
 * @return {Object} New table state.
 */
export function createTable( { rowCount, colCount, headerSection, footerSection } ) {
	return {
		...( headerSection && {
			head: [
				{
					cells: times( colCount, () => ( {
						content: '',
						tag: 'th',
					} ) ),
				},
			],
		} ),
		body: times( rowCount, () => ( {
			cells: times( colCount, () => ( {
				content: '',
				tag: 'td',
			} ) ),
		} ) ),
		...( footerSection && {
			foot: [
				{
					cells: times( colCount, () => ( {
						content: '',
						tag: 'td',
					} ) ),
				},
			],
		} ),
	};
}

/**
 * Inserts a row in the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to insert the row.
 * @param {number} options.rowIndex    Row index at which to insert the row.
 * @return {Object} New table state.
 */
export function insertRow( state, { sectionName, rowIndex } ) {
	// Number of columns in the row to be inserted.
	const sourceRowIndex = state[ sectionName ].length <= rowIndex ? 0 : rowIndex;
	const newRowColCount = state[ sectionName ][ sourceRowIndex ].cells.reduce(
		( count, cell ) => count + ( parseInt( cell.colSpan ) || 1 ),
		0
	);

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColCount, () => {
			return {
				content: '',
				tag: 'head' === sectionName ? 'th' : 'td',
			};
		} ),
	};

	return {
		[ sectionName ]: [
			...state[ sectionName ].slice( 0, rowIndex ),
			newRow,
			...state[ sectionName ].slice( rowIndex ),
		].map( ( row, currentRowIndex ) => ( {
			cells: row.cells.map( ( cell ) => {
				// Expand cells with rowspan in the before and inserted rows.
				if (
					cell.rowSpan &&
					currentRowIndex <= rowIndex &&
					currentRowIndex + parseInt( cell.rowSpan ) - 1 >= rowIndex
				) {
					return {
						...cell,
						rowSpan: parseInt( cell.rowSpan ) + 1,
					};
				}
				return cell;
			} ),
		} ) ),
	};
}

/**
 * Deletes a row from the table state.
 *
 * @param {Object} vTable              Virtual table in which to delete the row.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to delete the row.
 * @param {number} options.rowIndex    Row index at which to delete the row.
 * @return {Object} New table state.
 */
export function deleteRow( vTable, { sectionName, rowIndex } ) {
	// Do not allow tbody to be empty for table with thead /tfoot sections.
	if (
		sectionName === 'body' &&
		vTable.body.length === 1 &&
		vTable.head.length &&
		vTable.foot.length
	) {
		// eslint-disable-next-line no-alert, no-undef
		alert( __( 'The table body must have one or more rows.', 'flexible-table-block' ) );
		return vTable;
	}

	// Find the number of rowspan cells in the row to be deleted.
	const rowSpanCellsCount = vTable[ sectionName ][ rowIndex ].filter( ( cell ) => cell.rowSpan )
		.length;

	// Split the found rowspan cells.
	if ( rowSpanCellsCount ) {
		for ( let i = 0; i < rowSpanCellsCount; i++ ) {
			const vMergedCells = vTable[ sectionName ]
				.reduce( ( cells, row ) => {
					return cells.concat( row );
				}, [] )
				.filter( ( cell ) => cell.rowSpan && cell.rowIndex === rowIndex );

			if ( vMergedCells.length ) {
				vTable = splitMergedCells( vTable, {
					vSelectedCell: vMergedCells[ 0 ],
				} );
			}
		}
	}

	return {
		[ sectionName ]: vTable[ sectionName ]
			.map( ( row, currentRowIndex ) => ( {
				cells: row
					.map( ( cell ) => {
						// Contract cells with rowspan in the before rows.
						if (
							cell.rowSpan &&
							currentRowIndex < rowIndex &&
							currentRowIndex + parseInt( cell.rowSpan ) - 1 >= rowIndex
						) {
							return {
								...cell,
								rowSpan: parseInt( cell.rowSpan ) - 1,
							};
						}

						// Cells to be deleted (Mark as deletion).
						if ( currentRowIndex === rowIndex ) {
							return {
								...cell,
								isDelete: true,
							};
						}

						return cell;
					} )
					// Delete cells marked as deletion.
					.filter( ( cell ) => ! cell.isDelete ),
			} ) )
			// Delete empty rows.
			.filter( ( { cells } ) => {
				return cells.length;
			} ),
	};
}

/**
 * Inserts a column in the table state.
 *
 * @param {Object} vTable            Virtual table in which to delete the column.
 * @param {Object} options
 * @param {number} options.vColIndex Virtual column index at which to insert the column.
 * @return {Object} New table state.
 */
export function insertColumn( vTable, { vColIndex } ) {
	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	// Whether to add a column after the last column.
	const isLastColumnInsert = vTable.body[ 0 ].length === vColIndex;

	// Some cells will not be filled if there are cells with rowspan in the column to be inserted,
	// so record the rowindex of the additional cells to be inserted in advance.
	const rowIndexesToFill = { head: [], body: [], foot: [] };

	[ 'head', 'body', 'foot' ].forEach( ( sectionName ) => {
		vTable[ sectionName ].forEach( ( row, currentRowIndex ) => {
			row.forEach( ( cell, currentColIndex ) => {
				if ( currentColIndex === vColIndex && cell.rowSpan ) {
					for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
						rowIndexesToFill[ sectionName ].push( currentRowIndex + i );
					}
				}
			} );
		} );
	} );

	return mapValues( vSections, ( section, sectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( row, currentRowIndex ) => {
			return {
				cells: row
					.reduce( ( cells, cell, currentColIndex ) => {
						// Expand cells with colspan in the before columns.
						if (
							cell.colSpan &&
							currentColIndex < vColIndex &&
							currentColIndex + parseInt( cell.colSpan ) - 1 >= vColIndex
						) {
							cells.push( {
								...cell,
								colSpan: parseInt( cell.colSpan ) + 1,
							} );
							return cells;
						}

						// Insert cell ( after the last column ).
						if ( isLastColumnInsert && currentColIndex + 1 === vColIndex ) {
							cells.push( cell, {
								content: '',
								tag: 'head' === sectionName ? 'th' : 'td',
							} );
							return cells;
						}

						// Insert cell ( between columns ).
						if ( currentColIndex === vColIndex && ! cell.isDelete ) {
							cells.push(
								{
									content: '',
									tag: 'head' === sectionName ? 'th' : 'td',
								},
								cell
							);
							return cells;
						}

						// Insert cell (additional).
						if (
							currentColIndex === vColIndex &&
							rowIndexesToFill[ sectionName ].includes( currentRowIndex )
						) {
							cells.push(
								{
									content: '',
									tag: 'head' === sectionName ? 'th' : 'td',
								},
								cell
							);
							return cells;
						}

						cells.push( cell );
						return cells;
					}, [] )
					// Delete cells marked as deletion.
					.filter( ( cell ) => ! cell.isDelete ),
			};
		} );
	} );
}

/**
 * Deletes a column from the table state.
 *
 * @param {Object} state            Current table state.
 * @param {Object} options
 * @param {number} options.colIndex Column index to delete.
 * @return {Object} New table state.
 */
export function deleteColumn( state, { colIndex } ) {
	const tableSections = pick( state, [ 'head', 'body', 'foot' ] );

	return mapValues( tableSections, ( section ) => {
		// Bail early if the table section is empty.
		if ( isEmptyTableSection( section ) ) {
			return section;
		}

		return section
			.map( ( row ) => ( {
				cells:
					row.cells.length >= colIndex
						? row.cells.filter( ( cell, index ) => index !== colIndex )
						: row.cells,
			} ) )
			.filter( ( row ) => row.cells.length );
	} );
}

/**
 * Toggles the existance of a section.
 *
 * @param {Object} state       Current table state.
 * @param {string} sectionName Name of the section to toggle.
 * @return {Object} New table state.
 */
export function toggleSection( state, sectionName ) {
	// Section exists, replace it with an empty row to remove it.
	if ( ! isEmptyTableSection( state[ sectionName ] ) ) {
		return { [ sectionName ]: [] };
	}

	// Number of columns in the row to be inserted.
	const newRowColCount = state.body[ 0 ].cells.reduce( ( count, cell ) => {
		return count + ( parseInt( cell.colSpan ) || 1 );
	}, 0 );

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColCount, () => {
			return {
				content: '',
				tag: 'head' === sectionName ? 'th' : 'td',
			};
		} ),
	};

	return { [ sectionName ]: [ newRow ] };
}

/**
 * Merge cells in the table state.
 *
 * @param {Object} state                     Current table state.
 * @param {Object} options
 * @param {number} options.selectedRangeCell Current selected range cell.
 * @return {Object} New table state.
 */
export function mergeCells( state, { selectedRangeCell } ) {
	const { fromCell, toCell } = selectedRangeCell;
	const { sectionName } = fromCell;
	const section = state[ sectionName ];

	// TODO:範囲内に結合されたセルがあった場合は、一旦分割する

	// Calculate range to be merged.
	const minRowIndex = Math.min( fromCell.rowIndex, toCell.rowIndex );
	const maxRowIndex = Math.max( fromCell.rowIndex, toCell.rowIndex );
	const minColumnIndex = Math.min( fromCell.colIndex, toCell.colIndex );
	const maxColumnIndex = Math.max( fromCell.colIndex, toCell.colIndex );

	return {
		[ sectionName ]: section.map( ( row, rowIndex ) => {
			if ( rowIndex < minRowIndex || rowIndex > maxRowIndex ) {
				// Row not to be merged.
				return row;
			}

			return {
				cells: row.cells
					.map( ( cell, colIndex ) => {
						if ( colIndex === minColumnIndex && rowIndex === minRowIndex ) {
							// Cells to merge.
							const rowSpan = Math.abs( maxRowIndex - minRowIndex ) + 1;
							const colSpan = Math.abs( maxColumnIndex - minColumnIndex ) + 1;

							return {
								...cell,
								rowSpan: rowSpan > 1 ? rowSpan : undefined,
								colSpan: colSpan > 1 ? colSpan : undefined,
							};
						}

						// Cells to be merged (Mark as deletion).
						if (
							rowIndex >= minRowIndex &&
							rowIndex <= maxRowIndex &&
							colIndex >= minColumnIndex &&
							colIndex <= maxColumnIndex
						) {
							return {
								...cell,
								merged: true,
							};
						}

						// Cells not to be merged.
						return cell;
					} )
					// Delete cells marked as deletion.
					.filter( ( cell ) => ! cell.merged ),
			};
		} ),
	};
}

/**
 * Split cells in the virtual table state.
 *
 * @param {Object} vTable                Current virtual table state.
 * @param {Object} options
 * @param {number} options.vSelectedCell Current selected virtual cell.
 * @return {Object} New table state.
 */
export function splitMergedCells( vTable, { vSelectedCell } ) {
	const { sectionName, rowIndex, vColIndex, rowSpan, colSpan } = vSelectedCell;

	const vSection = vTable[ sectionName ];

	// Split the selected cells and map them on the virtual section.
	vSection[ rowIndex ][ vColIndex ] = {
		...vSection[ rowIndex ][ vColIndex ],
		rowSpan: undefined,
		colSpan: undefined,
	};

	if ( colSpan ) {
		for ( let i = 1; i < parseInt( colSpan ); i++ ) {
			vSection[ rowIndex ][ vColIndex + i ] = {
				...vSection[ rowIndex ][ vColIndex ],
				content: undefined,
			};
		}
	}

	if ( rowSpan ) {
		for ( let i = 1; i < parseInt( rowSpan ); i++ ) {
			vSection[ rowIndex + i ][ vColIndex ] = {
				...vSection[ rowIndex ][ vColIndex ],
				content: undefined,
			};

			if ( colSpan ) {
				for ( let j = 1; j < parseInt( colSpan ); j++ ) {
					vSection[ rowIndex + i ][ vColIndex + j ] = {
						...vSection[ rowIndex ][ vColIndex ],
						content: undefined,
					};
				}
			}
		}
	}

	return {
		...vTable,
		[ sectionName ]: vSection,
	};
}

/**
 * Update cells state( styles, tag ) of selected section.
 *
 * @param {Object} state                     Current table state.
 * @param {Object} cellState                 Cell states to update.
 * @param {Object} options
 * @param {Object} options.selectedCell      Current selected cell.
 * @param {Array}  options.selectedMultiCell Current selected multi cell.
 * @param {Object} options.selectedRangeCell Current selected range cell.
 * @return {Object} New section state.
 */
export function updateCellsState(
	state,
	cellState,
	{ selectedCell, selectedMultiCell, selectedRangeCell }
) {
	if (
		! selectedCell &&
		! isRangeSelected( selectedRangeCell ) &&
		! isMultiSelected( selectedMultiCell )
	) {
		return state;
	}

	const { sectionName, rowIndex, colIndex } = selectedCell;

	return {
		[ sectionName ]: state[ sectionName ].map( ( row, currentRowIndex ) => {
			if ( currentRowIndex !== rowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, currentColIndex ) => {
					if ( currentColIndex !== colIndex ) {
						return cell;
					}

					let stylesObj = convertToObject( cell?.styles );

					if ( cellState.styles ) {
						const styles = cellState.styles;

						if ( 'fontSize' in styles ) {
							stylesObj.fontSize = styles.fontSize;
						}

						if ( 'width' in styles ) {
							stylesObj.width = styles.width;
						}

						if ( 'color' in styles ) {
							stylesObj.color = styles.color;
						}

						if ( 'backgroundColor' in styles ) {
							stylesObj.backgroundColor = styles.backgroundColor;
						}

						if ( styles.padding ) {
							stylesObj = updatePadding( stylesObj, styles.padding );
						}

						if ( styles.borderWidth ) {
							stylesObj = updateBorderWidth( stylesObj, styles.borderWidth );
						}

						if ( styles.borderRadius ) {
							stylesObj = updateBorderRadius( stylesObj, styles.borderRadius );
						}

						if ( styles.borderStyle ) {
							stylesObj = updateBorderStyle( stylesObj, styles.borderStyle );
						}

						if ( styles.borderColor ) {
							stylesObj = updateBorderColor( stylesObj, styles.borderColor );
						}

						if ( 'textAlign' in styles ) {
							stylesObj.textAlign = styles.textAlign;
						}

						if ( 'verticalAlign' in styles ) {
							stylesObj.verticalAlign = styles.verticalAlign;
						}
					}

					const tag = cellState.tag || cell.tag;

					return {
						...cell,
						styles: convertToInline( stylesObj ),
						tag,
					};
				} ),
			};
		} ),
	};
}
