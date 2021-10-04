/**
 * External dependencies
 */
import { times, mapValues, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { isEmptySection } from './helper';
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
					selectedCell: vMergedCells[ 0 ],
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
 * @param {Object} vTable            Virtual table in which to insert column.
 * @param {Object} options
 * @param {number} options.vColIndex Virtual column index at which to insert column.
 * @return {Object} New table state.
 */
export function insertColumn( vTable, { vColIndex } ) {
	// Whether to add a column after the last column.
	const isLastColumnInsert = vTable.body[ 0 ].length === vColIndex;

	// Some cells will not be filled if there are cells with rowspan in the column to be inserted,
	// so record the rowindex of the additional cells to be inserted in advance.
	const rowIndexesToFill = { head: [], body: [], foot: [] };

	[ 'head', 'body', 'foot' ].forEach( ( sectionName ) => {
		vTable[ sectionName ].forEach( ( row, currentRowIndex ) => {
			row.forEach( ( cell, currentVColIndex ) => {
				if ( currentVColIndex === vColIndex && cell.rowSpan ) {
					for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
						rowIndexesToFill[ sectionName ].push( currentRowIndex + i );
					}
				}
			} );
		} );
	} );

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, sectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( row, currentRowIndex ) => {
			return {
				cells: row
					.reduce( ( cells, cell, currentVColIndex ) => {
						// Expand cells with colspan in the before columns.
						if (
							cell.colSpan &&
							currentVColIndex < vColIndex &&
							currentVColIndex + parseInt( cell.colSpan ) - 1 >= vColIndex
						) {
							cells.push( {
								...cell,
								colSpan: parseInt( cell.colSpan ) + 1,
							} );
							return cells;
						}

						// Insert cell ( after the last column ).
						if ( isLastColumnInsert && currentVColIndex + 1 === vColIndex ) {
							cells.push( cell, {
								content: '',
								tag: 'head' === sectionName ? 'th' : 'td',
							} );
							return cells;
						}

						// Insert cell ( between columns ).
						if ( currentVColIndex === vColIndex && ! cell.isDelete ) {
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
							currentVColIndex === vColIndex &&
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
 * @param {Object} vTable            Virtual table in which to delete column.
 * @param {Object} options
 * @param {number} options.vColIndex Virtual column index at which to delete column.
 * @return {Object} New table state.
 */
export function deleteColumn( vTable, { vColIndex } ) {
	// Find the colspan cells in the column to be deleted.
	const colSpanCells = [ ...vTable.head, ...vTable.body, ...vTable.foot ]
		.reduce( ( cells, row ) => {
			return cells.concat( row );
		}, [] )
		.filter( ( cell ) => cell.colSpan && cell.vColIndex === vColIndex );

	// Split the found colspan cells.
	if ( colSpanCells.length ) {
		colSpanCells.forEach( ( colSpanCell ) => {
			vTable = splitMergedCells( vTable, {
				selectedCell: colSpanCell,
			} );
		} );
	}

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return null;

		return section.map( ( row ) => {
			return {
				cells: row
					.map( ( cell, currentVColIndex ) => {
						// Contract cells with colspan in the before columns.
						if (
							cell.colSpan &&
							currentVColIndex < vColIndex &&
							currentVColIndex + parseInt( cell.colSpan ) - 1 >= vColIndex
						) {
							return {
								...cell,
								colSpan: parseInt( cell.colSpan ) - 1,
							};
						}

						// Cells to be deleted (Mark as deletion).
						if ( currentVColIndex === vColIndex ) {
							return {
								...cell,
								isDelete: true,
							};
						}

						return cell;
					}, [] )
					// Delete cells marked as deletion.
					.filter( ( cell ) => ! cell.isDelete ),
			};
		} );
	} );
}

/**
 * Toggles the existance of a section.
 *
 * @param {Object} vTable      Current virtual table state.
 * @param {string} sectionName Name of the section to toggle.
 * @return {Object} New table state.
 */
export function toggleSection( vTable, sectionName ) {
	// Section exists, replace it with an empty row to remove it.
	if ( ! isEmptySection( vTable[ sectionName ] ) ) {
		return { [ sectionName ]: [] };
	}

	// Number of columns in the row to be inserted.
	const newRowColCount = vTable.body[ 0 ].reduce( ( count, cell ) => {
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
 * @param {Object} vTable                Current virtual table state.
 * @param {Object} options
 * @param {number} options.selectedCells Current selected virtual cell.
 * @return {Object} New table state.
 */
export function mergeCells( vTable, { selectedCells } ) {
	const sectionName = selectedCells[ 0 ].sectionName;

	const rowIndexes = [ ...selectedCells.map( ( cell ) => cell.rowIndex ) ];
	const vColIndexes = [ ...selectedCells.map( ( cell ) => cell.vColIndex ) ];

	const minRowIndex = Math.min( rowIndexes );
	const maxRowIndex = Math.max( rowIndexes );
	const minVColIndex = Math.min( vColIndexes );
	const maxVColIndex = Math.max( vColIndexes );

	// Find the colspan cells in the column to be deleted.
	const rowColSpanCellsCount = selectedCells.filter( ( cell ) => cell.rowSpan || cell.colSpan );

	// Split the found rowspan & colspan cells.
	if ( rowColSpanCellsCount ) {
		for ( let i = 0; i < rowColSpanCellsCount; i++ ) {
			const vMergedCells = vTable[ sectionName ]
				.reduce( ( cells, row ) => {
					return cells.concat( row );
				}, [] )
				.filter(
					( cell ) =>
						( cell.rowSpan || cell.colSpan ) &&
						minRowIndex <= cell.rowIndex &&
						maxRowIndex >= cell.rowIndex &&
						minVColIndex <= cell.vColIndex &&
						maxVColIndex >= cell.vColIndex
				);

			if ( vMergedCells.length ) {
				vTable = splitMergedCells( vTable, {
					selectedCell: vMergedCells[ 0 ],
				} );
			}
		}
	}

	return {
		[ sectionName ]: vTable[ sectionName ].map( ( row, rowIndex ) => {
			if ( rowIndex < minRowIndex || rowIndex > maxRowIndex ) {
				// Row not to be merged.
				return row;
			}

			return {
				cells: row.cells
					.map( ( cell, colIndex ) => {
						if ( colIndex === minVColIndex && rowIndex === minRowIndex ) {
							// Cells to merge.
							const rowSpan = Math.abs( maxRowIndex - minRowIndex ) + 1;
							const colSpan = Math.abs( maxVColIndex - minVColIndex ) + 1;

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
							colIndex >= minVColIndex &&
							colIndex <= maxVColIndex
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
 * @param {Object} vTable               Current virtual table state.
 * @param {Object} options
 * @param {number} options.selectedCell Current selected virtual cell.
 * @return {Object} New table state.
 */
export function splitMergedCells( vTable, { selectedCell } ) {
	const { sectionName, rowIndex, vColIndex, rowSpan, colSpan } = selectedCell;

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
 * @param {Object} vTable                Current virtual table state.
 * @param {Object} cellState             Cell states to update.
 * @param {Object} options
 * @param {Array}  options.selectedCells Current selected multi cell.
 * @return {Object} New section state.
 */
export function updateCellsState( vTable, cellState, { selectedCells } ) {
	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, currentSectionName ) => {
		if ( ! section.length ) return null;

		return section.map( ( row, currentRowIndex ) => {
			return {
				cells: row
					.map( ( cell, currentVColIndex ) => {
						// Refer to the selected cell to determine if it is the target cell to update.
						const isTargetCell = !! selectedCells.some( ( targetCell ) => {
							return (
								targetCell.sectionName === currentSectionName &&
								targetCell.rowIndex === currentRowIndex &&
								targetCell.vColIndex === currentVColIndex
							);
						} );

						if ( ! isTargetCell ) {
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
					}, [] )
					// Delete cells marked as deletion.
					.filter( ( cell ) => ! cell.isDelete ),
			};
		} );
	} );
}
