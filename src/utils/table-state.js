/**
 * External dependencies
 */
import { times, get, mapValues, pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isEmptyTableSection,
	isEmptyRow,
	getFirstRow,
	isRangeSelected,
	isMultiSelected,
} from './helper';
import { convertToObject, convertToInline } from '../utils/style-converter';
import {
	updatePadding,
	updateBorderWidth,
	updateBorderRadius,
	updateBorderStyle,
	updateBorderColor,
} from '../utils/style-updater';

const INHERITED_COLUMN_ATTRIBUTES = [ 'align' ];

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
 * @param {number} options.columnCount Column count for the table to create.
 * @return {Object} New table state.
 */
export function insertRow( state, { sectionName, rowIndex, columnCount } ) {
	const firstRow = getFirstRow( state );
	const cellCount =
		columnCount === undefined ? get( firstRow, [ 'cells', 'length' ] ) : columnCount;

	// Bail early if the function cannot determine how many cells to add.
	if ( ! cellCount ) {
		return state;
	}

	return {
		[ sectionName ]: [
			...state[ sectionName ].slice( 0, rowIndex ),
			{
				cells: times( cellCount, ( index ) => {
					const firstCellInColumn = get( firstRow, [ 'cells', index ], {} );
					const inheritedAttributes = pick( firstCellInColumn, INHERITED_COLUMN_ATTRIBUTES );

					return {
						...inheritedAttributes,
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
					};
				} ),
			},
			...state[ sectionName ].slice( rowIndex ),
		],
	};
}

/**
 * Deletes a row from the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to delete the row.
 * @param {number} options.rowIndex    Row index to delete.
 * @return {Object} New table state.
 */
export function deleteRow( state, { sectionName, rowIndex } ) {
	return {
		[ sectionName ]: state[ sectionName ].filter( ( row, index ) => index !== rowIndex ),
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

	// Get the length of the first row of the body to use when creating the header.
	const columnCount = get( state, [ 'body', 0, 'cells', 'length' ], 1 );

	// Section doesn't exist, insert an empty row to create the section.
	return insertRow( state, { sectionName, rowIndex: 0, columnCount } );
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

						// Column not to be merged.
						return {
							...cell,
						};
					} )
					// Delete merged cells.
					.filter( ( cell ) => ! cell.merged ),
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

	const {
		sectionName,
		rowIndex: selectedRowIndex,
		columnIndex: selectedColumnIndex,
	} = selectedCell;

	return {
		[ sectionName ]: state[ sectionName ].map( ( row, rowIndex ) => {
			if ( rowIndex !== selectedRowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, columnIndex ) => {
					if ( columnIndex !== selectedColumnIndex ) {
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
