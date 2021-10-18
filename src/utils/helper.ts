/**
 * External dependencies
 */
import { identity, isEmpty, isObject, mapValues, pickBy } from 'lodash';

// Array with four values for CSS
export type FourCssValues = [ string, string, string, string ];

/**
 * Removed falsy values from nested object.
 *
 * @param  object Nested object.
 * @return Object cleaned from falsy values.
 */
export const cleanEmptyObject = ( object: {} ): {} | undefined => {
	if ( ! isObject( object ) || Array.isArray( object ) ) {
		return object;
	}

	const cleanedNestedObjects: {} = pickBy( mapValues( object, cleanEmptyObject ), identity );

	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
};

/**
 * Convert short-hand/long-hand CSS values into an array with four values.
 *
 * @param  cssValue CSS value.
 * @return Array with four values.
 */
export function parseCssValue( cssValue: string ): FourCssValues {
	if ( typeof cssValue !== 'string' ) {
		return [ '', '', '', '' ];
	}

	const cssValues: string[] = cssValue.split( ' ' );

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
