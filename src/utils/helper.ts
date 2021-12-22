/**
 * External dependencies
 */
import _, { identity, isEmpty, isObject, mapValues, pickBy } from 'lodash';
import type { PropertyValue } from 'csstype';

const DEFAULT_PRECISION: number = 4;

// Array with four values for CSS
export type FourCssValues = [ string, string, string, string ];

// sanitizeUnitValue function option
interface SanitizeOptions {
	minNum?: number;
	maxNum?: number;
	precision?: number;
}

/**
 * Removed falsy values from nested object.
 *
 * @param  object Nested object.
 * @return Object cleaned from falsy values.
 */
export function cleanEmptyObject( object: {} ): {} | undefined {
	if ( ! isObject( object ) || Array.isArray( object ) ) {
		return object;
	}

	const cleanedNestedObjects: {} = pickBy( mapValues( object, cleanEmptyObject ), identity );

	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
}

/**
 * Convert short-hand/long-hand CSS values into an array with four values.
 *
 * @param  cssValue CSS value.
 * @return Array with four values.
 */
export function parseCssValue( cssValue: string ): FourCssValues {
	const cssValues: string[] = cssValue.split( ' ' ).map( ( value: string ) => value.toLowerCase() );

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

/**
 * Sanitize the value of UnitControl.
 *
 * @param  initialValue UnitControl value.
 * @param  options      Sanitize options.
 * @return Sanitized UnitControl value.
 */
export function sanitizeUnitValue(
	initialValue: PropertyValue< string | number > | undefined,
	options?: SanitizeOptions
): string {
	const value: string = String( initialValue ).trim();
	let num: number = parseFloat( value );

	if ( isNaN( num ) ) {
		return '';
	} else if ( num < 0 ) {
		return '';
	} else if ( num === 0 ) {
		return '0';
	}

	// Sanitize value.
	if ( options?.minNum ) {
		num = Math.max( options.minNum, num );
	}

	if ( options?.maxNum ) {
		num = Math.min( options.maxNum, num );
	}

	num = _.floor( num, options?.precision || DEFAULT_PRECISION );

	const unit: string = value.match( /[\d.\-+]*\s*(.*)/ )?.[ 1 ] ?? '';

	return `${ num }${ unit.toLowerCase() }`;
}

/**
 * Parses a number and unit from a value.
 *
 * @param  initialValue Value to parse
 * @return The extracted number and unit.
 */
export function parseUnit( initialValue: string ): [ number, string ] {
	const value: string = String( initialValue ).trim();
	const num: number = parseFloat( value );

	if ( isNaN( num ) ) {
		return [ 0, '' ];
	}

	const unit: string = value.match( /[\d.\-+]*\s*(.*)/ )?.[ 1 ] ?? '';

	return [ num, unit.toLowerCase() ];
}

/**
 * Convert string to number.
 *
 * @param  value        String to converted.
 * @param  defaultValue String to be used when the value is falsy.
 */
export function toInteger( value: number | string | undefined, defaultValue = 0 ): number {
	if ( ! value ) {
		return defaultValue;
	}

	const converted = parseInt( String( value ), 10 );

	if ( isNaN( converted ) ) {
		return defaultValue;
	}

	return converted || defaultValue;
}
