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
				sectionName,
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

	// Fallback: Fill with empty cells if any cells are not filled correctly.
	vSection.forEach( ( row, currentRowIndex ) => {
		row.forEach( ( cell, currentVColIndex ) => {
			if ( ! cell.isFilled ) {
				vSection[ currentRowIndex ][ currentVColIndex ] = {
					content: '',
					tag: 'head' === sectionName ? 'th' : 'td',
					isFilled: true,
					rowIndex: null,
					colIdex: null,
					vColIndex: currentVColIndex,
				};
			}
		} );
	} );

	return vSection;
}

/**
 * Determines whether the selected cells is rectangle shape in the virtual table.
 *
 * @param {Array} selectedCells Current selected multi cell.
 * @return {boolean} True if the selected cells is rectangle shape, false otherwise.
 */
export function isRectangleSelected( selectedCells ) {
	if ( ! selectedCells ) return false;

	const rowIndexes = [ ...selectedCells.map( ( cell ) => cell.rowIndex ) ];
	const vColIndexes = [ ...selectedCells.map( ( cell ) => cell.vColIndex ) ];

	// Get the position of the rectangle's vertices based on the minimum and maximum matrix values of the selected cells.
	const topLeft = { x: Math.min( vColIndexes ), y: Math.min( rowIndexes ) };
	const topRight = { x: Math.max( vColIndexes ), y: Math.min( rowIndexes ) };
	const bottomRight = { x: Math.max( vColIndexes ), y: Math.max( rowIndexes ) };
	const bottomLeft = { x: Math.min( vColIndexes ), y: Math.max( rowIndexes ) };

	// Check if it represents a rectangle from four points.
	const isRectangle =
		topLeft.x === bottomLeft.x &&
		topLeft.y === topRight.y &&
		topRight.x === bottomRight.x &&
		bottomRight.y === bottomLeft.y;

	if ( ! isRectangle ) return false;

	// Generate indexed matrix from the four points.
	const vRange = [];

	for ( let i = topLeft.y; i < bottomLeft.y; i++ ) {
		vRange[ i ] = [];
		for ( let j = topLeft.x; j < topRight.x; j++ ) {
			vRange[ i ][ j ] = false;
		}
	}

	// Map the selected cells to the matrix.
	selectedCells.forEach( ( { rowIndex, vColIndex, rowSpan, colSpan } ) => {
		if ( vRange[ rowIndex ][ vColIndex ] ) {
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

	// Whether all cells are filled.
	const isFullFilled = vRange
		.reduce( ( cells, row ) => {
			return cells.concat( row );
		}, [] )
		.every( ( cell ) => cell === true );

	return isFullFilled;
}
