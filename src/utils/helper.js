/**
 * External dependencies
 */
import { identity, isEmpty, isObject, mapValues, pickBy } from 'lodash';

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
 * @return {string[]} CSS values.
 */
export function parseCssValue( value ) {
	if ( typeof value !== 'string' ) {
		return [ '', '', '', '' ];
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
			return [ '', '', '', '' ];
	}
}
