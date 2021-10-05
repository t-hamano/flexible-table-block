/**
 * External dependencies
 */
import { times, pickBy, isEmpty, isObject, identity, mapValues } from 'lodash';

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
 * @param {Object} object
 * @return {Object} Object cleaned from falsy values
 */
export const cleanEmptyObject = ( object ) => {
	if ( ! isObject( object ) || Array.isArray( object ) ) {
		return object;
	}

	const cleanedNestedObjects = pickBy( mapValues( object, cleanEmptyObject ), identity );

	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
};

/**
 * Convert shorthand / longhand CSS values to array.
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
 * Determines whether a virtual section is empty.
 *
 * @param {Object} vSection Virtual section state.
 * @return {boolean} True if the virtual section is empty, false otherwise.
 */
export function isEmptySection( vSection ) {
	return ! vSection || ! vSection.length || vSection.every( ( row ) => ! ( row && row.length ) );
}

/**
 * Create virtual section array with the cells placed in positions based on how they actually look.
 * This function is used to determine the apparent position of a cell when insert / delete row / column, or merge / split cells, etc.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {Object} options.sectionName Section in which to transform to virtual section.
 * @return {Array} Array of virtual section.
 */
export function toVirtualSection( state, { sectionName } ) {
	const section = state[ sectionName ];

	if ( ! section.length ) return [];

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
	section.forEach( ( row, cRowIndex ) => {
		row.cells.forEach( ( cell, cColIndex ) => {
			// Colmun index on the virtual section excluding cells already marked as "filled".
			const vColIndex = vSection[ cRowIndex ].findIndex( ( { isFilled } ) => ! isFilled );

			if ( vColIndex === -1 ) {
				return;
			}

			// Mark the cell as "filled" and record the position on the virtual section.
			vSection[ cRowIndex ][ vColIndex ] = {
				...cell,
				sectionName,
				isFilled: true,
				rowIndex: cRowIndex,
				colIndex: cColIndex,
				vColIndex,
			};

			// For cells with rowspan/colspan, mark cells that are visually filled as "filled".
			// Additionaly mark it as a cell to be deleted because it does not exist in the actual section.
			if ( cell.colSpan ) {
				for ( let i = 1; i < parseInt( cell.colSpan ); i++ ) {
					vSection[ cRowIndex ][ vColIndex + i ].isFilled = true;
					vSection[ cRowIndex ][ vColIndex + i ].isDelete = true;
				}
			}

			if ( cell.rowSpan ) {
				for ( let i = 1; i < parseInt( cell.rowSpan ); i++ ) {
					vSection[ cRowIndex + i ][ vColIndex ].isFilled = true;
					vSection[ cRowIndex + i ][ vColIndex ].isDelete = true;

					if ( cell.colSpan ) {
						for ( let j = 1; j < parseInt( cell.colSpan ); j++ ) {
							vSection[ cRowIndex + i ][ vColIndex + j ].isFilled = true;
							vSection[ cRowIndex + i ][ vColIndex + j ].isDelete = true;
						}
					}
				}
			}
		} );
	} );

	// Fallback: Fill with empty cells if any cells are not filled correctly.
	vSection.forEach( ( row, cRowIndex ) => {
		row.forEach( ( cell, cVColIndex ) => {
			if ( ! cell.isFilled ) {
				vSection[ cRowIndex ][ cVColIndex ] = {
					content: '',
					tag: 'head' === sectionName ? 'th' : 'td',
					isFilled: true,
					rowIndex: null,
					colIdex: null,
					vColIndex: cVColIndex,
				};
			}
		} );
	} );

	return vSection;
}

/**
 * Determines whether a rectangle will be formed from the selected cells in the virtual table.
 * This function is used to determines whether to allow cell merging from the selected cells.
 *
 * @param {Array} selectedCells Current selected multi cell.
 * @return {boolean} True if a rectangle will be formed from the selected cells, false otherwise.
 */
export function isRectangleSelected( selectedCells ) {
	if ( ! selectedCells ) return false;

	if ( selectedCells.length === 1 ) return false;

	// Get the minimum / maximum virtual indexes of the matrix from the selected cells.
	const vRangeIndexes = selectedCells.reduce(
		( { minRowIndex, maxRowIndex, minColIndex, maxColIndex }, cell ) => {
			const vRowIndex = cell.rowSpan ? cell.rowIndex + parseInt( cell.rowSpan ) - 1 : cell.rowIndex;
			const vColIndex = cell.colSpan
				? cell.vColIndex + parseInt( cell.colSpan ) - 1
				: cell.vColIndex;

			return {
				minRowIndex: minRowIndex < cell.rowIndex ? minRowIndex : cell.rowIndex,
				maxRowIndex: maxRowIndex > vRowIndex ? maxRowIndex : vRowIndex,
				minColIndex: minColIndex < cell.vColIndex ? minColIndex : cell.vColIndex,
				maxColIndex: maxColIndex > vColIndex ? maxColIndex : vColIndex,
			};
		},
		{
			minRowIndex: selectedCells[ 0 ].rowIndex,
			maxRowIndex: selectedCells[ 0 ].rowIndex,
			minColIndex: selectedCells[ 0 ].vColIndex,
			maxColIndex: selectedCells[ 0 ].vColIndex,
		}
	);

	// Generate indexed matrix from the indexes.
	const vRange = [];

	for ( let i = vRangeIndexes.minRowIndex; i <= vRangeIndexes.maxRowIndex; i++ ) {
		vRange[ i ] = [];
		for ( let j = vRangeIndexes.minColIndex; j <= vRangeIndexes.maxColIndex; j++ ) {
			vRange[ i ][ j ] = false;
		}
	}

	// Map the selected cells to the matrix (mark the cell as "true").
	selectedCells.forEach( ( { rowIndex, vColIndex, rowSpan, colSpan } ) => {
		if ( rowIndex in vRange && vColIndex in vRange[ rowIndex ] ) {
			vRange[ rowIndex ][ vColIndex ] = true;

			if ( rowSpan ) {
				for ( let i = 1; i < parseInt( rowSpan ); i++ ) {
					vRange[ rowIndex + i ][ vColIndex ] = true;
				}
			}

			if ( colSpan ) {
				for ( let i = 1; i < parseInt( colSpan ); i++ ) {
					vRange[ rowIndex ][ vColIndex + i ] = true;
				}
			}
		}
	} );

	// Whether all cells in the matrix are filled (whether cell merging is possible or not).
	const isFullFilled = vRange
		.reduce( ( cells, row ) => cells.concat( row ), [] )
		.every( ( cell ) => cell === true );

	return isFullFilled;
}
