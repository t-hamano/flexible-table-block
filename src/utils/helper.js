/**
 * External dependencies
 */
import { every, times, pickBy, isEmpty, isObject, identity, mapValues } from 'lodash';

/**
 * Sanitize the value of UnitControl.
 *
 * @param {string} value UnitControl value.
 * @return {string} Sanitized UnitControl value.
 */
export function toUnitVal( value ) {
	const parsedValue = parseFloat( value );

	if ( isNaN( parsedValue ) || 0 > parsedValue ) {
		return undefined;
	} else if ( parsedValue === 0 ) {
		return 0;
	}
	return value;
}

/**
 * Removed falsy values from nested object.
 *
 * @param {*} object
 * @return {*} Object cleaned from falsy values
 */
export const cleanEmptyObject = ( object ) => {
	if ( ! isObject( object ) || Array.isArray( object ) ) {
		return object;
	}
	const cleanedNestedObjects = pickBy( mapValues( object, cleanEmptyObject ), identity );
	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
};

/**
 * Convert css values to array.
 *
 * @param {string} value CSS value.
 * @return {Array} CSS values.
 */
export function parseCssValue( value ) {
	if ( typeof value !== 'string' ) {
		return [ null, null, null, null ];
	}

	const values = value.split( ' ' );

	switch ( values.length ) {
		case 1:
			return [ values[ 0 ], values[ 0 ], values[ 0 ], values[ 0 ] ];
		case 2:
			return [ values[ 0 ], values[ 1 ], values[ 0 ], values[ 1 ] ];
		case 3:
			return [ values[ 0 ], values[ 1 ], values[ 2 ], values[ 1 ] ];
		case 4:
			return [ values[ 0 ], values[ 1 ], values[ 2 ], values[ 3 ] ];
		default:
			return [ null, null, null, null ];
	}
}

/**
 * Determines whether a table row is empty.
 *
 * @param {Object} row Table row state.
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyRow( row ) {
	return ! ( row.cells && row.cells.length );
}

/**
 * Determines whether a table section is empty.
 *
 * @param {Object} section Table section state.
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyTableSection( section ) {
	return ! section || ! section.length || every( section, isEmptyRow );
}

/**
 * Determines Whether multi cells is selected.
 *
 * @param {Object} selectedMultiCell Current table state.
 * @return {boolean} True if multi cells is selected, false otherwise.
 */
export function isMultiSelected( selectedMultiCell ) {
	return !! ( selectedMultiCell && selectedMultiCell.length > 1 );
}

/**
 * Determines Whether range cells is selected.
 *
 * @param {Object} selectedRangeCell Current table state.
 * @return {boolean} True if range cells is selected, false otherwise.
 */
export function isRangeSelected( selectedRangeCell ) {
	return !! ( selectedRangeCell && selectedRangeCell.fromCell && selectedRangeCell.toCell );
}

/**
 * Create virtual section array with the cells placed in positions based on how they actually look.
 * This function is used to determine the apparent position of a cell when insert / delete row / column, or merge / split cells, etc.
 *
 * @param {Object} state                Current table state.
 * @param {Object} options
 * @param {Object} options.sectionName  Section in which to transform to virtual section.
 * @param {Object} options.selectedCell Current selected cell.
 * @return {Object | boolean} Array of virtual section if all the cells of the virtual section are filled, false otherwise.
 */
export function toVirtualSection( state, { sectionName, selectedCell } ) {
	const section = state[ sectionName ];

	// Mark the selected cells.
	if ( selectedCell ) {
		section[ selectedCell.rowIndex ].cells[ selectedCell.colIndex ].isSelected = true;
	}

	// Create a virtual section array.
	const vRowCount = section.length;
	const vColCount = section[ 0 ].cells.reduce( ( count, cell ) => {
		return count + ( parseInt( cell.colSpan ) || 1 );
	}, 0 );

	const vSection = times( vRowCount, () =>
		times( vColCount, () => ( {
			isFilled: false, // Whether the actual cell is placed or not.
		} ) )
	);

	// Mapping the actual section cells on the virtual section cell.
	section.forEach( ( row, currentRowIndex ) => {
		row.cells.forEach( ( cell, currentColIndex ) => {
			// Colmun index on the virtual section excluding cells already marked as "filled".
			const vColIndex = vSection[ currentRowIndex ].findIndex( ( { isFilled } ) => ! isFilled );

			if ( vColIndex === -1 ) {
				return;
			}

			// Mark the cell as "filled" and record the position on the virtual section.
			vSection[ currentRowIndex ][ vColIndex ] = {
				...cell,
				isFilled: true,
				rowIndex: currentRowIndex,
				colIndex: currentColIndex,
				vColIndex,
			};

			// For cells with rowspan/colspan, mark cells that are visually filled as "filled".
			if ( cell.colSpan ) {
				for ( let i = 1; i < parseInt( cell.colSpan ); i++ ) {
					vSection[ currentRowIndex ][ vColIndex + i ].isFilled = true;
					// Mark it as a cell to be deleted because it does not exist in the actual section.
					vSection[ currentRowIndex ][ vColIndex + i ].isDelete = true;
				}
			}

			if ( cell.rowSpan ) {
				for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
					vSection[ currentRowIndex + i ][ vColIndex ].isFilled = true;
					// Mark it as a cell to be deleted because it does not exist in the actual section.
					vSection[ currentRowIndex + i ][ vColIndex ].isDelete = true;

					if ( cell.colSpan ) {
						for ( let j = 1; j < parseInt( cell.colSpan ); j++ ) {
							vSection[ currentRowIndex + i ][ vColIndex + j ].isFilled = true;
							// Mark it as a cell to be deleted because it does not exist in the actual section.
							vSection[ currentRowIndex + i ][ vColIndex + j ].isDelete = true;
						}
					}
				}
			}
		} );
	} );

	// Check if there are any virtual section cells that are not filled.
	const notFilledCells = vSection
		.reduce( ( cells, row ) => {
			return cells.concat( row );
		}, [] )
		.filter( ( cell ) => ! cell.isFilled );

	return notFilledCells.length ? false : vSection;
}
