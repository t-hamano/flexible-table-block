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
	return isNaN( parseFloat( value ) ) || 0 > parseFloat( value ) ? undefined : value;
}

/**
 * External dependencies
 */

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
 * Convert inline css string to object.
 *
 * @param {string} styles  inline CSS.
 * @param {string} element target element.
 * @return {Object} CSS styles.
 */
export function parseInlineStyles( styles, element = '' ) {
	if ( ! styles || typeof styles !== 'string' ) {
		return {};
	}

	let newStylesObj = {};

	const stylesObj = styles
		.split( ';' )
		.filter( ( style ) => style.split( ':' )[ 0 ] && style.split( ':' )[ 1 ] )
		.map( ( style ) => [
			style
				.split( ':' )[ 0 ]
				.trim()
				.replace( /-./g, ( c ) => c.substr( 1 ).toUpperCase() ),
			style.split( ':' )[ 1 ].trim(),
		] )
		.reduce(
			( styleObj, style ) => ( {
				...styleObj,
				[ style[ 0 ] ]: style[ 1 ],
			} ),
			{}
		);

	// Create styles for table element.
	if ( element === 'table' ) {
		newStylesObj = {
			width: stylesObj?.width,
			maxWidth: stylesObj?.maxWidth,
			minWidth: stylesObj?.minWidth,
			borderSeparate: stylesObj?.minWidth,
		};

		// border-spacing property.
		const borderSpacingValues = parseCssValue( stylesObj?.borderSpacing );
		newStylesObj.borderSpacing = {
			top: borderSpacingValues[ 1 ],
			right: borderSpacingValues[ 0 ],
			bottom: borderSpacingValues[ 1 ],
			left: borderSpacingValues[ 0 ],
		};
	}

	// Create styles for table-cell element.
	if ( element === 'cell' ) {
		// padding property.
		if ( stylesObj.padding ) {
			const paddingValues = parseCssValue( stylesObj.padding );
			newStylesObj.padding = {
				top: paddingValues[ 0 ],
				right: paddingValues[ 1 ],
				bottom: paddingValues[ 2 ],
				left: paddingValues[ 3 ],
			};
		} else {
			newStylesObj.padding = {
				top: stylesObj?.paddingTop,
				right: stylesObj?.paddingRight,
				bottom: stylesObj?.paddingBottom,
				left: stylesObj?.paddingLeft,
			};
		}
	}

	// Create styles for table or table-cell element.
	if ( element === 'table' || element === 'cell' ) {
		// border-width property.
		if ( stylesObj.borderWidth ) {
			const borderWidthValues = parseCssValue( stylesObj.borderWidth );
			newStylesObj.borderWidth = {
				top: borderWidthValues[ 0 ],
				right: borderWidthValues[ 1 ],
				bottom: borderWidthValues[ 2 ],
				left: borderWidthValues[ 3 ],
			};
		} else {
			newStylesObj.borderWidth = {
				top: stylesObj?.borderTopWidth,
				right: stylesObj?.borderRightWidth,
				bottom: stylesObj?.borderBottomWidth,
				left: stylesObj?.borderLeftWidth,
			};
		}

		// border-color property.
		if ( stylesObj.borderColor ) {
			const borderColorValues = parseCssValue( stylesObj.borderColor );
			newStylesObj.borderColor = {
				top: borderColorValues[ 0 ],
				right: borderColorValues[ 1 ],
				bottom: borderColorValues[ 2 ],
				left: borderColorValues[ 3 ],
			};
		} else {
			newStylesObj.borderColor = {
				top: stylesObj?.borderTopColor,
				right: stylesObj?.borderRightColor,
				bottom: stylesObj?.borderBottomColor,
				left: stylesObj?.borderLeftColor,
			};
		}

		// border-style property.
		if ( stylesObj.borderStyle ) {
			const borderStyleValues = parseCssValue( stylesObj.borderStyle );
			newStylesObj.borderStyle = {
				top: borderStyleValues[ 0 ],
				right: borderStyleValues[ 1 ],
				bottom: borderStyleValues[ 2 ],
				left: borderStyleValues[ 3 ],
			};
		} else {
			newStylesObj.borderStyle = {
				top: stylesObj?.borderTopStyle,
				right: stylesObj?.borderRightStyle,
				bottom: stylesObj?.borderBottomStyle,
				left: stylesObj?.borderLeftStyle,
			};
		}

		// border-radius property.
		if ( stylesObj.bordertyle ) {
			const borderRadiusValues = parseCssValue( stylesObj.borderRadius );
			newStylesObj.borderRadius = {
				top: borderRadiusValues[ 0 ],
				right: borderRadiusValues[ 1 ],
				bottom: borderRadiusValues[ 2 ],
				left: borderRadiusValues[ 3 ],
			};
		} else {
			newStylesObj.borderRadius = {
				top: stylesObj?.borderTopLeftRadius,
				right: stylesObj?.borderTopRightRadius,
				bottom: stylesObj?.borderBottomRightRadius,
				left: stylesObj?.borderBottomLeftRadius,
			};
		}
	}

	return cleanEmptyObject( newStylesObj );
}

/**
 * Convert css values to array taking into account shorthand.
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
 * Get CSS inline style from CSS styles object.
 *
 * @param {Object} stylesObj CSS styles.
 * @return {string} CSS inline style.
 */
export function getInlineStyle( stylesObj ) {
	if ( ! stylesObj || typeof stylesObj !== 'object' ) {
		return '';
	}

	const lines = Object.keys( stylesObj ).reduce( function ( result, key ) {
		const property = key.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
		const value = stylesObj[ key ];
		if ( value ) {
			result.push( `${ property }:${ value };` );
		}
		return result;
	}, [] );

	return lines.join( '' );
}

/**
 * Get border-width styles object from BoxControl values.
 *
 * @param {Object} values BoxControl values.
 * @return {Object} border-width styles object.
 */
export function getBorderWidthStylesObj( values ) {
	const cleanValues = cleanEmptyObject( values );
	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return {};
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			borderTopWidth: top,
			borderRightWidth: right,
			borderBottomWidth: bottom,
			borderLeftWidth: left,
		};
	}

	if ( top === right && top === bottom && top === right ) {
		return {
			borderWidth: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			borderWidth: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			borderWidth: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		borderTopWidth: top,
		borderRightWidth: right,
		borderBottomWidth: bottom,
		borderLeftWidth: left,
	};
}

/**
 * Get border-radius styles object from BoxControl values.
 *
 * @param {Object} values BoxControl values.
 * @return {Object} border-radius styles object.
 */
export function getBorderRadiusStylesObj( values ) {
	const cleanValues = cleanEmptyObject( values );
	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return {};
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			borderTopLeftRadius: top,
			borderTopRightRadius: right,
			borderBottomRightRadius: bottom,
			borderBottomLeftRadius: left,
		};
	}

	if ( top === right && top === bottom && top === right ) {
		return {
			borderRadius: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			borderRadius: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			borderRadius: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		borderTopLeftRadius: top,
		borderTopRightRadius: right,
		borderBottomRightRadius: bottom,
		borderBottomLeftRadius: left,
	};
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
 * Returns whether the cell at `cellLocation` is included in the selection `selection`.
 *
 * @param {Object} cellLocation An object containing cell location properties.
 * @param {Object} selection    An object containing selection properties.
 * @return {boolean} True if the cell is selected, false otherwise.
 */
export function isCellSelected( cellLocation, selection ) {
	if ( ! cellLocation || ! selection ) {
		return false;
	}

	switch ( selection.type ) {
		case 'column':
			return 'column' === selection.type && cellLocation.columnIndex === selection.columnIndex;
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
