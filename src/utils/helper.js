/**
 * External dependencies
 */
import { every } from 'lodash';

/**
 * Sanitize the value of UnitControl.
 *
 * @param {string} value UnitControl value.
 *
 * @return {string} Sanitized UnitControl value.
 */
export function toUnitVal( value ) {
	return ( isNaN( parseFloat( value ) ) || 0 > parseFloat( value ) ) ? undefined : value;
}

/**
 * External dependencies
 */
import { pickBy, isEmpty, isObject, identity, mapValues } from 'lodash';

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
	const cleanedNestedObjects = pickBy(
		mapValues( object, cleanEmptyObject ),
		identity
	);
	return isEmpty( cleanedNestedObjects ) ? undefined : cleanedNestedObjects;
};

/**
 * Convert inline css string to object.
 *
 * @param {string} styles inline CSS.
 *
 * @return {Object} CSS styles.
 */
export function parseInlineCss( styles ) {
	if ( 'string' !== typeof styles ) {
			return styles;
	}

	return styles
			.split( ';' )
			.filter( style => style.split( ':' )[0] && style.split( ':' )[1])
			.map( style => [
					style.split( ':' )[0].trim().replace( /-./g, c => c.substr( 1 ).toUpperCase() ),
					style.split( ':' )[1].trim()
			])
			.reduce( ( styleObj, style ) => ({
					...styleObj,
					[style[0]]: style[1]
			}), {});
}

/**
 * Convert css values to object taking into account shorthand.
 *
 * @param {string}  value   CSS value.
 * @param {boolean} reverse Because the horizontal and vertical directions are specified in reverse in border-spacing.
 *
 * @return {Object} CSS values.
 */
export function parseCssValue( value, reverse = false ) {
	if ( 'string' !== typeof value ) {
			return {
				top: null,
				left: null,
				right: null,
				bottom: null
			};
	}

	const values = value.split( ' ' );

	switch ( values.length ) {
		case 1:
		return {
			top: value,
			left: value,
			right: value,
			bottom: value
		};
		case 2:

			if ( reverse ) {

				// border-spacing values.
				return {
					top: values[1],
					left: values[0],
					right: values[0],
					bottom: values[1]
				};
			} else {

				// Other property values.
				return {
					top: values[0],
					left: values[1],
					right: values[1],
					bottom: values[0]
				};
			}
		case 3:
		return {
			top: values[0],
			left: values[1],
			right: values[1],
			bottom: values[2]
		};
		case 4:
			return {
				top: values[0],
				left: values[1],
				right: values[2],
				bottom: values[3]
			};
		default:
			return {
				top: null,
				left: null,
				right: null,
				bottom: null
			};
	}
}

/**
 * Convert object to css values to object taking into account shorthand.
 *
 * @param {string} value CSS value.
 *
 * @return {Object} CSS values.
 */
export function createCssValue( value ) {
	const values = value.split( ' ' );

	switch ( values.length ) {
		case 1:
		return {
			top: value,
			left: value,
			right: value,
			bottom: value
		};
		case 2:
			return {
				top: values[0],
				left: values[1],
				right: values[1],
				bottom: values[0]
			};
		case 3:
		return {
			top: values[0],
			left: values[1],
			right: values[1],
			bottom: values[2]
		};
		case 4:
			return {
				top: values[0],
				left: values[1],
				right: values[2],
				bottom: values[3]
			};
		default:
			return {
				top: undefined,
				left: undefined,
				right: undefined,
				bottom: undefined
			};
	}
}

/**
 * Gets styles for table.
 *
 * @param {Object} attributes Table attributes.
 *
 * @return {Object} Table style.
 */

/**
 * Determines whether a table row is empty.
 *
 * @param {Object} row Table row state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyRow( row ) {
	return ! ( row.cells && row.cells.length );
}

/**
 * Determines whether a table section is empty.
 *
 * @param {Object} section Table section state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyTableSection( section ) {
	return ! section || ! section.length || every( section, isEmptyRow );
}

/**
 * Returns whether the cell at `cellLocation` is included in the selection `selection`.
 *
 * @param {Object} cellLocation An object containing cell location properties.
 * @param {Object} selection    An object containing selection properties.
 *
 * @return {boolean} True if the cell is selected, false otherwise.
 */
export function isCellSelected( cellLocation, selection ) {
	if ( ! cellLocation || ! selection ) {
		return false;
	}

	switch ( selection.type ) {
		case 'column':
			return (
				'column' === selection.type &&
				cellLocation.columnIndex === selection.columnIndex
			);
		case 'cell':
			return (
				'cell' === selection.type &&
				cellLocation.sectionName === selection.sectionName &&
				cellLocation.columnIndex === selection.columnIndex &&
				cellLocation.rowIndex === selection.rowIndex
			);
	}
}

/**
 * Returns the first row in the table.
 *
 * @param {Object} state Current table state.
 *
 * @return {Object} The first table row.
 */
export function getFirstRow( state ) {
	if ( ! isEmptyTableSection( state.head ) ) {
		return state.head[ 0 ];
	}
	if ( ! isEmptyTableSection( state.body ) ) {
		return state.body[ 0 ];
	}
	if ( ! isEmptyTableSection( state.foot ) ) {
		return state.foot[ 0 ];
	}
}
