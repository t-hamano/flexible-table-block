/**
 * External dependencies
 */
import _ from 'lodash';

interface SanitizeOptions {
	minNum?: number;
	maxNum?: number;
	precision?: number;
}

const DEFAULT_PRECISION: number = 4;

/**
 * Sanitize the value of UnitControl.
 *
 * @param  initialValue UnitControl value.
 * @param  options      Sanitize options.
 * @return Sanitized UnitControl value.
 */
export function sanitizeUnitValue( initialValue: string, options?: SanitizeOptions ): string {
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
