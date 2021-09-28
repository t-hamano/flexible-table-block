/**
 * External dependencies
 */
import { every, pickBy, isEmpty, isObject, identity, mapValues } from 'lodash';

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
 * Return the all range of the specified section.
 *
 * @param {Object} state       Current table state.
 * @param {string} sectionName Selected section.
 * @return {Object} Start and end cells for range selection.
 */
export function getSectionRange( state, sectionName ) {
	if ( ! state[ sectionName ] ) return undefined;

	const lastRowIndex = state[ sectionName ].length - 1;
	const lastColumnIndex = state[ sectionName ][ lastRowIndex ].cells.length - 1;

	const fromCell = {
		sectionName,
		rowIndex: 0,
		columnIndex: 0,
	};

	const toCell = {
		sectionName,
		rowIndex: lastRowIndex,
		columnIndex: lastColumnIndex,
	};

	return { fromCell, toCell };
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
 * Determines Whether a table has merged cells.
 *
 * @param {Object} state Current table state.
 * @return {boolean} True if table has merged cells, false otherwise.
 */
export function hasMergedCells( state ) {
	[ 'head', 'body', 'foot' ].forEach( ( section ) => {
		state[ section ].forEach( ( { cells } ) => {
			cells.forEach( ( { rowSpan, colSpan } ) => {
				if ( rowSpan || colSpan ) {
					return true;
				}
			} );
		} );
	} );

	return false;
}
