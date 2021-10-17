/**
 * External dependencies
 */
import { identity, isEmpty, isObject, mapValues, pickBy } from 'lodash';

type fourCssValues = [ string, string, string, string ];

type nestedObject = {};

/**
 * Removed falsy values from nested object.
 *
 * @param  object Nested object.
 * @return Object cleaned from falsy values.
 */
export const cleanEmptyObject = ( object: nestedObject ): nestedObject | undefined => {
	if ( ! isObject( object ) || Array.isArray( object ) ) {
		return object;
	}

	const cleanedNestedObjects = pickBy( mapValues( object, cleanEmptyObject ), identity );

	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
};

/**
 * Convert short-hand/long-hand CSS values into an array with four values.
 *
 * @param  cssValue CSS value.
 * @return Array with four values.
 */
export function parseCssValue( cssValue: string ): fourCssValues {
	if ( typeof cssValue !== 'string' ) {
		return [ '', '', '', '' ];
	}

	const cssValues = cssValue.split( ' ' );

	switch ( cssValues.length ) {
		case 1:
			return [ cssValues[ 0 ], cssValues[ 0 ], cssValues[ 0 ], cssValues[ 0 ] ];
		case 2:
			return [ cssValues[ 0 ], cssValues[ 1 ], cssValues[ 0 ], cssValues[ 1 ] ];
		case 3:
			return [ cssValues[ 0 ], cssValues[ 1 ], cssValues[ 2 ], cssValues[ 1 ] ];
		case 4:
			return [ cssValues[ 0 ], cssValues[ 1 ], cssValues[ 2 ], cssValues[ 3 ] ];
		default:
			return [ '', '', '', '' ];
	}
}
