/**
 * External dependencies
 */
import { times, mapValues, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { isEmptySection, getVirtualRange, toVirtualRows } from './helper';
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
 * Inserts a row in the virtual table state.
 *
 * @param {Object} vTable              Virtual table in which to insert the row.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to insert the row.
 * @param {number} options.rowIndex    Row index at which to insert the row.
 * @return {Object} New virtual table state.
 */
export function insertRow( vTable, { sectionName, rowIndex } ) {
	// Number of columns in the row to be inserted.
	const sourceRowIndex = vTable[ sectionName ].length <= rowIndex ? 0 : rowIndex;
	const newRowColCount = vTable[ sectionName ][ sourceRowIndex ].cells.reduce(
		( count, cell ) => count + ( parseInt( cell.colSpan ) || 1 ),
		0
	);

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColCount, () => ( {
			content: '',
			tag: 'head' === sectionName ? 'th' : 'td',
		} ) ),
	};

	return {
		[ sectionName ]: [
			...vTable[ sectionName ].slice( 0, rowIndex ),
			newRow,
			...vTable[ sectionName ].slice( rowIndex ),
		].map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell ) => {
				// Expand cells with rowspan in the before and inserted rows.
				if (
					cell.rowSpan &&
					cRowIndex <= rowIndex &&
					cRowIndex + parseInt( cell.rowSpan ) - 1 >= rowIndex
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
 * Deletes a row from the virtual table.
 *
 * @param {Object} vTable              Virtual table in which to delete the row.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to delete the row.
 * @param {number} options.rowIndex    Row index at which to delete the row.
 * @return {Object} New virtual table state.
 */
export function deleteRow( vTable, { sectionName, rowIndex } ) {
	// Find the number of rowspan cells in the row to be deleted.
	const rowSpanCellsCount = vTable[ sectionName ][ rowIndex ].cells.filter(
		( cell ) => cell.rowSpan
	).length;

	// Split the found rowspan cells.
	if ( rowSpanCellsCount ) {
		for ( let i = 0; i < rowSpanCellsCount; i++ ) {
			const vMergedCells = vTable[ sectionName ]
				.reduce( ( cells, row ) => cells.concat( row.cells ), [] )
				.filter( ( cell ) => cell.rowSpan && cell.rowIndex === rowIndex );

			if ( vMergedCells.length ) {
				vTable = splitMergedCell( vTable, {
					selectedCell: vMergedCells[ 0 ],
				} );
			}
		}
	}

	return {
		[ sectionName ]: vTable[ sectionName ].map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell ) => {
				// Contract cells with rowspan in the before rows.
				if (
					cell.rowSpan &&
					cRowIndex < rowIndex &&
					cRowIndex + parseInt( cell.rowSpan ) - 1 >= rowIndex
				) {
					return {
						...cell,
						rowSpan: parseInt( cell.rowSpan ) - 1,
					};
				}

				// Cells to be deleted (Mark as deletion).
				if ( cRowIndex === rowIndex ) {
					return {
						...cell,
						isDelete: true,
					};
				}

				return cell;
			} ),
		} ) ),
	};
}

/**
 * Inserts a column in the virtual table.
 *
 * @param {Object} vTable            Virtual table in which to insert column.
 * @param {Object} options
 * @param {number} options.vColIndex Virtual column index at which to insert column.
 * @return {Object} New virtual table state.
 */
export function insertColumn( vTable, { vColIndex } ) {
	// Whether to add a column after the last column.
	const isLastColumnInsert = vTable.body[ 0 ].cells.length === vColIndex;

	// Some cells will not be filled if there are cells with rowspan in the column to be inserted,
	// so record the rowindex of the additional cells to be inserted in advance.
	const rowIndexesToFill = { head: [], body: [], foot: [] };

	[ 'head', 'body', 'foot' ].forEach( ( sectionName ) => {
		vTable[ sectionName ].forEach( ( { cells }, cRowIndex ) => {
			cells.forEach( ( cell, cVColIndex ) => {
				if ( cVColIndex === vColIndex && cell.rowSpan ) {
					for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
						rowIndexesToFill[ sectionName ].push( cRowIndex + i );
					}
				}
			} );
		} );
	} );

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, sectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells }, cRowIndex ) => ( {
			cells: cells.reduce( ( newCells, cell, cVColIndex ) => {
				// Expand cells with colspan in the before columns.
				if (
					cell.colSpan &&
					cVColIndex < vColIndex &&
					cVColIndex + parseInt( cell.colSpan ) - 1 >= vColIndex
				) {
					newCells.push( {
						...cell,
						colSpan: parseInt( cell.colSpan ) + 1,
					} );
					return newCells;
				}

				// Insert cell (after the last column).
				if ( isLastColumnInsert && cVColIndex + 1 === vColIndex ) {
					newCells.push( cell, {
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
					} );
					return newCells;
				}

				// Insert cell (between columns).
				if ( cVColIndex === vColIndex && ! cell.isDelete ) {
					newCells.push(
						{
							content: '',
							tag: 'head' === sectionName ? 'th' : 'td',
						},
						cell
					);
					return newCells;
				}

				// Insert cell (additional).
				if ( cVColIndex === vColIndex && rowIndexesToFill[ sectionName ].includes( cRowIndex ) ) {
					newCells.push(
						{
							content: '',
							tag: 'head' === sectionName ? 'th' : 'td',
						},
						cell
					);
					return newCells;
				}

				newCells.push( cell );
				return newCells;
			}, [] ),
		} ) );
	} );
}

/**
 * Deletes a column from the virtual table.
 *
 * @param {Object} vTable            Virtual table in which to delete column.
 * @param {Object} options
 * @param {number} options.vColIndex Virtual column index at which to delete column.
 * @return {Object} New virtual table state.
 */
export function deleteColumn( vTable, { vColIndex } ) {
	// Find the colspan cells in the column to be deleted.
	const vRows = toVirtualRows( vTable );
	const colSpanCells = vRows
		.reduce( ( cells, row ) => cells.concat( row ), [] )
		.filter( ( cell ) => cell.colSpan && cell.vColIndex === vColIndex );

	// Split the found colspan cells.
	if ( colSpanCells.length ) {
		colSpanCells.forEach(
			( colSpanCell ) => ( vTable = splitMergedCell( vTable, { selectedCell: colSpanCell } ) )
		);
	}

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells } ) => ( {
			cells: cells.map( ( cell, cVColIndex ) => {
				// Contract cells with colspan in the before columns.
				if (
					cell.colSpan &&
					cVColIndex < vColIndex &&
					cVColIndex + parseInt( cell.colSpan ) - 1 >= vColIndex
				) {
					return {
						...cell,
						colSpan: parseInt( cell.colSpan ) - 1,
					};
				}

				// Cells to be deleted (Mark as deletion).
				if ( cVColIndex === vColIndex ) {
					return {
						...cell,
						isDelete: true,
					};
				}

				return cell;
			}, [] ),
		} ) );
	} );
}

/**
 * Toggles the existance of a section.
 *
 * @param {Object} vTable      Current virtual table state.
 * @param {string} sectionName Name of the section to toggle.
 * @return {Object} New virtual table state.
 */
export function toggleSection( vTable, sectionName ) {
	// Section exists, replace it with an empty row to remove it.
	if ( ! isEmptySection( vTable[ sectionName ] ) ) {
		return { [ sectionName ]: [] };
	}

	// Number of columns in the row to be inserted.
	const newRowColCount = vTable.body[ 0 ].cells.reduce( ( count, cell ) => {
		if ( cell.isDelete ) return count;
		return count + ( parseInt( cell.colSpan ) || 1 );
	}, 0 );

	// Row state to be inserted.
	const newRow = {
		cells: times( newRowColCount, () => ( {
			content: '',
			tag: 'head' === sectionName ? 'th' : 'td',
		} ) ),
	};

	return { [ sectionName ]: [ newRow ] };
}

/**
 * Merge cells in the virtual table.
 *
 * @param {Object} vTable                Current virtual table state.
 * @param {Object} options
 * @param {number} options.selectedCells Current selected multi cell.
 * @return {Object} New virtual table state.
 */
export function mergeCells( vTable, { selectedCells } ) {
	const { sectionName } = selectedCells[ 0 ];

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes = getVirtualRange( selectedCells );

	const { minRowIndex, maxRowIndex, minColIndex, maxColIndex } = vRangeIndexes;

	// Find the rowspan & colspan cells.
	const rowColSpanCellsCount = selectedCells.filter( ( cell ) => cell.rowSpan || cell.colSpan );

	// Split the found rowspan & colspan cells.
	if ( rowColSpanCellsCount ) {
		for ( let i = 0; i < rowColSpanCellsCount; i++ ) {
			const vMergedCells = vTable[ sectionName ]
				.reduce( ( cells, row ) => cells.concat( row ), [] )
				.filter(
					( cell ) =>
						( cell.rowSpan || cell.colSpan ) &&
						minRowIndex <= cell.rowIndex &&
						maxRowIndex >= cell.rowIndex &&
						minColIndex <= cell.vColIndex &&
						maxColIndex >= cell.vColIndex
				);

			if ( vMergedCells.length ) {
				vTable = splitMergedCell( vTable, { selectedCell: vMergedCells[ 0 ] } );
			}
		}
	}

	return {
		[ sectionName ]: vTable[ sectionName ].map( ( { cells }, rowIndex ) => {
			if ( rowIndex < minRowIndex || rowIndex > maxRowIndex ) {
				// Row not to be merged.
				return { cells: cells.filter( ( cell ) => ! cell.isDelete ) };
			}

			return {
				cells: cells.map( ( cell, colIndex ) => {
					if ( colIndex === minColIndex && rowIndex === minRowIndex ) {
						// Cells to merge.
						const rowSpan = Math.abs( maxRowIndex - minRowIndex ) + 1;
						const colSpan = Math.abs( maxColIndex - minColIndex ) + 1;

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
						colIndex >= minColIndex &&
						colIndex <= maxColIndex
					) {
						return {
							...cell,
							isMerged: true,
						};
					}

					// Cells not to be merged.
					return cell;
				} ),
			};
		} ),
	};
}

/**
 * Split selected cells in the virtual table state.
 *
 * @param {Object} vTable                Current virtual table state.
 * @param {Object} options
 * @param {number} options.selectedCells Current selected multi cell.
 * @return {Object} New virtual table state.
 */
export function splitMergedCells( vTable, { selectedCells } ) {
	// Find the rowspan & colspan cells.
	const rowColSpanCells = selectedCells.filter( ( cell ) => cell.rowSpan || cell.colSpan );

	// Split the found rowspan & colspan cells.
	if ( rowColSpanCells.length ) {
		rowColSpanCells.forEach( ( selectedCell ) => {
			vTable = splitMergedCell( vTable, { selectedCell } );
		} );
	}

	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells } ) => ( {
			cells: cells.map( ( cell ) => cell, [] ),
		} ) );
	} );
}

/**
 * Split single cell in the virtual table state.
 *
 * @param {Object} vTable               Current virtual table state.
 * @param {Object} options
 * @param {number} options.selectedCell Current selected virtual cell.
 * @return {Object} New virtual table state.
 */
export function splitMergedCell( vTable, { selectedCell } ) {
	const { sectionName, rowIndex, vColIndex, rowSpan, colSpan } = selectedCell;

	const vSection = vTable[ sectionName ];

	// Split the selected cells and map them on the virtual section.
	vSection[ rowIndex ].cells[ vColIndex ] = {
		...vSection[ rowIndex ].cells[ vColIndex ],
		rowSpan: undefined,
		colSpan: undefined,
	};

	if ( colSpan ) {
		for ( let i = 1; i < parseInt( colSpan ); i++ ) {
			vSection[ rowIndex ].cells[ vColIndex + i ] = {
				...vSection[ rowIndex ].cells[ vColIndex ],
				content: undefined,
			};
		}
	}

	if ( rowSpan ) {
		for ( let i = 1; i < parseInt( rowSpan ); i++ ) {
			vSection[ rowIndex + i ].cells[ vColIndex ] = {
				...vSection[ rowIndex ].cells[ vColIndex ],
				content: undefined,
			};

			if ( colSpan ) {
				for ( let j = 1; j < parseInt( colSpan ); j++ ) {
					vSection[ rowIndex + i ].cells[ vColIndex + j ] = {
						...vSection[ rowIndex ].cells[ vColIndex ],
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
 * @return {Object} New virtual table state.
 */
export function updateCellsState( vTable, cellState, { selectedCells } ) {
	const vSections = pick( vTable, [ 'head', 'body', 'foot' ] );

	return mapValues( vSections, ( section, cSectionName ) => {
		if ( ! section.length ) return [];

		return section.map( ( { cells }, cRowIndex ) => ( {
			cells: cells.map( ( cell, cVColIndex ) => {
				// Refer to the selected cell to determine if it is the target cell to update.
				const isTargetCell = !! selectedCells.some(
					( targetCell ) =>
						targetCell.sectionName === cSectionName &&
						targetCell.rowIndex === cRowIndex &&
						targetCell.vColIndex === cVColIndex
				);

				if ( ! isTargetCell ) return cell;

				let stylesObj = convertToObject( cell?.styles );

				if ( cellState.styles ) {
					const styles = cellState.styles;

					stylesObj = { ...stylesObj, ...styles };
					stylesObj = updatePadding( stylesObj, styles?.padding );
					stylesObj = updateBorderWidth( stylesObj, styles?.borderWidth );
					stylesObj = updateBorderRadius( stylesObj, styles?.borderRadius );
					stylesObj = updateBorderStyle( stylesObj, styles?.borderStyle );
					stylesObj = updateBorderColor( stylesObj, styles?.borderColor );
				}

				return {
					...cell,
					styles: convertToInline( stylesObj ),
					tag: cellState.tag || cell.tag,
					className: cellState.className || undefined,
				};
			}, [] ),
		} ) );
	} );
}
