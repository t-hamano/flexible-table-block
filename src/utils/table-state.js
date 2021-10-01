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
import {
	isEmptyTableSection,
	isEmptyRow,
	isRangeSelected,
	isMultiSelected,
	toVirtualSection,
} from './helper';
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
 * @param {number}  options.columnCount   Column count for the table to create.
 * @param {boolean} options.headerSection With/without header section.
 * @param {boolean} options.footerSection With/without footer section.
 * @return {Object} New table state.
 */
export function createTable( { rowCount, columnCount, headerSection, footerSection } ) {
	return {
		...( headerSection && {
			head: [
				{
					cells: times( columnCount, () => ( {
						content: '',
						tag: 'th',
					} ) ),
				},
			],
		} ),
		body: times( rowCount, () => ( {
			cells: times( columnCount, () => ( {
				content: '',
				tag: 'td',
			} ) ),
		} ) ),
		...( footerSection && {
			foot: [
				{
					cells: times( columnCount, () => ( {
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
	const newRowColumnCount = state[ sectionName ][ rowIndex ].cells.reduce( function (
		count,
		cell
	) {
		return count + ( parseInt( cell.colSpan ) || 1 );
	},
	0 );

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColumnCount, () => {
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
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to delete the row.
 * @param {number} options.rowIndex    Row index at which to delete the row.
 * @return {Object} New table state.
 */
export function deleteRow( state, { sectionName, rowIndex } ) {
	// Do not allow tbody to be empty for table with thead /tfoot sections.
	if (
		sectionName === 'body' &&
		state.body.length === 1 &&
		state.head.length &&
		state.foot.length
	) {
		// eslint-disable-next-line no-alert, no-undef
		alert( __( 'The table body must have one or more rows.', 'flexible-table-block' ) );
		return state;
	}

	let newState = state;

	// Find the number of rowspan cells in the row to be deleted.
	const rowSpanCellsCount = newState[ sectionName ][ rowIndex ].cells.filter(
		( cell ) => cell.rowSpan
	).length;

	// Split the found rowspan cells.
	if ( rowSpanCellsCount ) {
		for ( let i = 0; i < rowSpanCellsCount; i++ ) {
			const selectedCell = {
				sectionName,
				rowIndex,
				columnIndex: newState[ sectionName ][ rowIndex ].cells.findIndex(
					( cell ) => cell.rowSpan
				),
			};

			newState = splitMergedCells( newState, { selectedCell } );
		}
	}

	return {
		[ sectionName ]: newState[ sectionName ]
			.map( ( row, currentRowIndex ) => ( {
				cells: row.cells
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

						return { ...cell };
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
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {number} options.columnIndex Column index at which to insert the column.
 * @return {Object} New table state.
 */
export function insertColumn( state, { columnIndex } ) {
	const tableSections = pick( state, [ 'head', 'body', 'foot' ] );

	return mapValues( tableSections, ( section, sectionName ) => {
		// Bail early if the table section is empty.
		if ( isEmptyTableSection( section ) ) {
			return section;
		}

		return section.map( ( row ) => {
			// Bail early if the row is empty or it's an attempt to insert past
			// the last possible index of the array.
			if ( isEmptyRow( row ) || row.cells.length < columnIndex ) {
				return row;
			}

			return {
				cells: [
					...row.cells.slice( 0, columnIndex ),
					{
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
					},
					...row.cells.slice( columnIndex ),
				],
			};
		} );
	} );
}

/**
 * Deletes a column from the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {number} options.columnIndex Column index to delete.
 * @return {Object} New table state.
 */
export function deleteColumn( state, { columnIndex } ) {
	const tableSections = pick( state, [ 'head', 'body', 'foot' ] );

	return mapValues( tableSections, ( section ) => {
		// Bail early if the table section is empty.
		if ( isEmptyTableSection( section ) ) {
			return section;
		}

		return section
			.map( ( row ) => ( {
				cells:
					row.cells.length >= columnIndex
						? row.cells.filter( ( cell, index ) => index !== columnIndex )
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
	const newRowColumnCount = state.body[ 0 ].cells.reduce( function ( count, cell ) {
		return count + ( parseInt( cell.colSpan ) || 1 );
	}, 0 );

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColumnCount, () => {
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
	const minColumnIndex = Math.min( fromCell.columnIndex, toCell.columnIndex );
	const maxColumnIndex = Math.max( fromCell.columnIndex, toCell.columnIndex );

	return {
		[ sectionName ]: section.map( ( row, rowIndex ) => {
			if ( rowIndex < minRowIndex || rowIndex > maxRowIndex ) {
				// Row not to be merged.
				return row;
			}

			return {
				cells: row.cells
					.map( ( cell, columnIndex ) => {
						if ( columnIndex === minColumnIndex && rowIndex === minRowIndex ) {
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
							columnIndex >= minColumnIndex &&
							columnIndex <= maxColumnIndex
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
 * Split cells in the table state.
 *
 * @param {Object} state                Current table state.
 * @param {Object} options
 * @param {number} options.selectedCell Current selected cell.
 * @return {Object} New table state.
 */
export function splitMergedCells( state, { selectedCell } ) {
	const { sectionName } = selectedCell;

	// Create virtual section array with the cells placed in positions based on how they actually look.
	const vSection = toVirtualSection( state, { sectionName, selectedCell } );

	if ( ! vSection ) return state;

	// The selected cell on the virtual section.
	const vSelectedCell = vSection
		.reduce( ( cells, row ) => {
			return cells.concat( row );
		}, [] )
		.filter( ( cell ) => cell.isSelected )[ 0 ];

	// Split the selected cells and map them on the virtual section.
	vSection[ vSelectedCell.vRowIndex ][ vSelectedCell.vColumnIndex ] = {
		...vSection[ vSelectedCell.vRowIndex ][ vSelectedCell.vColumnIndex ],
		rowSpan: undefined,
		colSpan: undefined,
	};

	if ( vSelectedCell.colSpan ) {
		for ( let i = 1; i < parseInt( vSelectedCell.colSpan ); i++ ) {
			vSection[ vSelectedCell.vRowIndex ][ vSelectedCell.vColumnIndex + i ] = {
				...vSection[ vSelectedCell.vRowIndex ][ vSelectedCell.vColumnIndex ],
				content: undefined,
			};
		}
	}

	if ( vSelectedCell.rowSpan ) {
		for ( let i = 1; i < parseInt( vSelectedCell.rowSpan ); i++ ) {
			vSection[ vSelectedCell.vRowIndex + i ][ vSelectedCell.vColumnIndex ] = {
				...vSection[ vSelectedCell.vRowIndex ][ vSelectedCell.vColumnIndex ],
				content: undefined,
			};

			if ( vSelectedCell.colSpan ) {
				for ( let j = 1; j < parseInt( vSelectedCell.colSpan ); j++ ) {
					vSection[ vSelectedCell.vRowIndex + i ][ vSelectedCell.vColumnIndex + j ] = {
						...vSection[ vSelectedCell.vRowIndex ][ vSelectedCell.vColumnIndex ],
						content: undefined,
					};
				}
			}
		}
	}

	return {
		[ sectionName ]: vSection.map( ( row ) => {
			return {
				cells: row
					.map( ( cell ) => {
						// Remove unnecessary properties.
						delete cell.vRowIndex;
						delete cell.vColumnIndex;
						delete cell.isSelected;
						delete cell.isFilled;

						return cell;
					} )
					// Delete cells marked as deletion.
					.filter( ( cell ) => ! cell.isDelete ),
			};
		} ),
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

	const { sectionName, rowIndex, columnIndex } = selectedCell;

	return {
		[ sectionName ]: state[ sectionName ].map( ( row, currentRowIndex ) => {
			if ( currentRowIndex !== rowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, currentColumnIndex ) => {
					if ( currentColumnIndex !== columnIndex ) {
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
