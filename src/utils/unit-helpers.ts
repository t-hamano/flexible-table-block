import { toNumber } from 'lodash';

/**
 * Sanitize the value of UnitControl.
 *
 * @param {string} value UnitControl value.
 * @return {string} Sanitized UnitControl value.
 */
export function toUnitVal( value: string ): string {
	const parsedValue = toNumber( value );

	if ( isNaN( parsedValue ) || 0 > parsedValue ) {
		return '';
	} else if ( parsedValue === 0 ) {
		return '0';
	}

	return value;
}

/**
 * Parses a number and unit from a value.
 *
 * @param {string} initialValue Value to parse
 * @return {Array} The extracted number and unit.
 */
export function parseUnit( initialValue: string ): [ number, string ] {
	const value = String( initialValue ).trim();
	let num = parseFloat( value );
	num = isNaN( num ) ? 0 : num;

	const unit = value.match( /[\d.\-+]*\s*(.*)/ )?.[ 1 ] ?? '';

	return [ num, unit.toLowerCase() ];
}
