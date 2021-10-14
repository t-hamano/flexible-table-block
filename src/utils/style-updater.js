/* eslint-disable jsdoc/no-undefined-types */

/**
 * Internal dependencies
 */
import { cleanEmptyObject, toUnitVal } from './helper';

/* eslint-disable-next-line jsdoc/valid-types */
/**
 * @typedef {import('csstype').StandardLonghandProperties} StylesObject
 * @typedef {{ top?: string, right?: string, bottom?: string, left?: string }} BoxValues
 */

/**
 * Update padding style of styles object.
 *
 * @param {StylesObject} styles Styles object.
 * @param {BoxValues}    values padding values object.
 * @return {StylesObject} New Styles object.
 */
export function updatePadding( styles, values ) {
	if ( ! values ) return styles;

	const newStyles = { ...styles };

	delete newStyles.padding;
	delete newStyles.paddingTop;
	delete newStyles.paddingRight;
	delete newStyles.paddingBottom;
	delete newStyles.paddingLeft;
	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return newStyles;
	}

	const top = toUnitVal( cleanValues.top );
	const right = toUnitVal( cleanValues.right );
	const bottom = toUnitVal( cleanValues.bottom );
	const left = toUnitVal( cleanValues.left );

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...newStyles,
			paddingTop: top,
			paddingRight: right,
			paddingBottom: bottom,
			paddingLeft: left,
		};
	}

	if ( top === right && top === bottom && top === left ) {
		return {
			...newStyles,
			padding: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...newStyles,
			padding: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...newStyles,
			padding: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...newStyles,
		padding: `${ top } ${ right } ${ bottom } ${ left } `,
	};
}

/**
 * Update border-spacing style of styles object.
 *
 * @param {StylesObject}                             styles Styles object.
 * @param {{horizontal?: string, vertical?: string}} values border-spacing values object.
 * @return {StylesObject} New Styles object.
 */
export function updateBorderSpacing( styles, values ) {
	if ( ! values ) return styles;

	const newStyles = { ...styles };

	delete newStyles.borderSpacing;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return newStyles;
	}

	const horizontal = toUnitVal( cleanValues.horizontal );
	const vertical = toUnitVal( cleanValues.vertical );

	if ( horizontal === vertical ) {
		return {
			...newStyles,
			borderSpacing: horizontal,
		};
	}

	return {
		...newStyles,
		borderSpacing: `${ horizontal } ${ vertical }`,
	};
}

/**
 * Update border-width style of styles object.
 *
 * @param {StylesObject} styles Styles object.
 * @param {BoxValues}    values border-width values object.
 * @return {StylesObject} New Styles object.
 */
export function updateBorderWidth( styles, values ) {
	if ( ! values ) return styles;

	const newStyles = { ...styles };

	delete newStyles.borderWidth;
	delete newStyles.borderTopWidth;
	delete newStyles.borderRightWidth;
	delete newStyles.borderBottomWidth;
	delete newStyles.borderLeftWidth;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return newStyles;
	}

	const top = toUnitVal( cleanValues.top );
	const right = toUnitVal( cleanValues.right );
	const bottom = toUnitVal( cleanValues.bottom );
	const left = toUnitVal( cleanValues.left );

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...newStyles,
			borderTopWidth: top,
			borderRightWidth: right,
			borderBottomWidth: bottom,
			borderLeftWidth: left,
		};
	}

	if ( top === right && top === bottom && top === left ) {
		return {
			...newStyles,
			borderWidth: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...newStyles,
			borderWidth: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...newStyles,
			borderWidth: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...newStyles,
		borderWidth: `${ top } ${ right } ${ bottom } ${ left } `,
	};
}

/**
 * Update border-radius style of styles object.
 *
 * @param {StylesObject}                                                               styles Styles object.
 * @param {{topLeft?:string,topRight?:string,bottomRight?:string, bottomLeft?:string}} values border-radius values object.
 * @return {StylesObject} New Styles object.
 */
export function updateBorderRadius( styles, values ) {
	if ( ! values ) return styles;

	const newStyles = { ...styles };

	delete newStyles.borderRadius;
	delete newStyles.borderTopLeftRadius;
	delete newStyles.borderTopRightRadius;
	delete newStyles.borderBottomRightRadius;
	delete newStyles.borderBottomLeftRadius;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues ) {
		return newStyles;
	}

	if ( typeof cleanValues !== 'object' && typeof cleanValues !== 'string' ) {
		return newStyles;
	}

	if ( typeof cleanValues === 'string' ) {
		return {
			...newStyles,
			borderRadius: toUnitVal( cleanValues ),
		};
	}

	const topLeft = toUnitVal( cleanValues.topLeft );
	const topRight = toUnitVal( cleanValues.topRight );
	const bottomRight = toUnitVal( cleanValues.bottomRight );
	const bottomLeft = toUnitVal( cleanValues.bottomLeft );

	if ( ! topLeft || ! topRight || ! bottomRight || ! bottomLeft ) {
		return {
			...newStyles,
			borderTopLeftRadius: topLeft,
			borderTopRightRadius: topRight,
			borderBottomRightRadius: bottomRight,
			borderBottomLeftRadius: bottomLeft,
		};
	}

	if ( topLeft === topRight && topLeft === bottomRight && topLeft === bottomLeft ) {
		return {
			...newStyles,
			borderRadius: topLeft,
		};
	} else if ( topLeft === bottomRight && topRight === bottomLeft ) {
		return {
			...newStyles,
			borderRadius: `${ topLeft } ${ topRight }`,
		};
	} else if ( topRight === bottomLeft ) {
		return {
			...newStyles,
			borderRadius: `${ topLeft } ${ topRight } ${ bottomRight }`,
		};
	}

	return {
		...newStyles,
		borderRadius: `${ topLeft } ${ topRight } ${ bottomRight } ${ bottomLeft }`,
	};
}

/**
 * Update border-style style of styles object.
 *
 * @param {StylesObject} styles Styles object.
 * @param {BoxValues}    values border-style values object.
 * @return {StylesObject} New Styles object.
 */
export function updateBorderStyle( styles, values ) {
	if ( ! values ) return styles;

	const newStyles = { ...styles };

	delete newStyles.borderStyle;
	delete newStyles.borderTopStyle;
	delete newStyles.borderRightStyle;
	delete newStyles.borderBottomStyle;
	delete newStyles.borderLeftStyle;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return newStyles;
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...newStyles,
			borderTopStyle: top,
			borderRightStyle: right,
			borderBottomStyle: bottom,
			borderLeftStyle: left,
		};
	}

	if ( top === right && top === bottom && top === left ) {
		return {
			...newStyles,
			borderStyle: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...newStyles,
			borderStyle: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...newStyles,
			borderStyle: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...newStyles,
		borderTopStyle: top,
		borderRightStyle: right,
		borderBottomStyle: bottom,
		borderLeftStyle: left,
	};
}

/**
 * Update border-scoloryle style of styles object.
 *
 * @param {StylesObject} styles Styles object.
 * @param {BoxValues}    values border-color values object.
 * @return {StylesObject} New Styles object.
 */
export function updateBorderColor( styles, values ) {
	if ( ! values ) return styles;

	const newStyles = { ...styles };

	delete newStyles.borderColor;
	delete newStyles.borderTopColor;
	delete newStyles.borderRightColor;
	delete newStyles.borderBottomColor;
	delete newStyles.borderLeftColor;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return newStyles;
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...newStyles,
			borderTopColor: top,
			borderRightColor: right,
			borderBottomColor: bottom,
			borderLeftColor: left,
		};
	}

	if ( top === right && top === bottom && top === left ) {
		return {
			...newStyles,
			borderColor: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...newStyles,
			borderColor: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...newStyles,
			borderColor: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...newStyles,
		borderTopColor: top,
		borderRightColor: right,
		borderBottomColor: bottom,
		borderLeftColor: left,
	};
}
