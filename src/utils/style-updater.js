/**
 * Internal dependencies
 */
import { cleanEmptyObject, toUnitVal } from './helper';

/**
 * Update border-spacing style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-spacing values object.
 * @return {Object} New Styles object.
 */
export function updateBorderSpacingStyles( styles, values ) {
	delete styles.borderSpacing;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const top = toUnitVal( cleanValues.top );
	const left = toUnitVal( cleanValues.left );

	if ( top === left ) {
		return {
			...styles,
			borderSpacing: top,
		};
	}

	return {
		...styles,
		borderSpacing: `${ left } ${ top }`,
	};
}

/**
 * Update border-width style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-width values object.
 * @return {Object} New Styles object.
 */
export function updateBorderWidthStyles( styles, values ) {
	delete styles.borderWidth;
	delete styles.borderTopWidth;
	delete styles.borderRightWidth;
	delete styles.borderBottomWidth;
	delete styles.borderLeftWidth;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const top = toUnitVal( cleanValues.top );
	const right = toUnitVal( cleanValues.right );
	const bottom = toUnitVal( cleanValues.bottom );
	const left = toUnitVal( cleanValues.left );

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...styles,
			borderTopWidth: top,
			borderRightWidth: right,
			borderBottomWidth: bottom,
			borderLeftWidth: left,
		};
	}

	if ( top === right && top === bottom && top === left ) {
		return {
			...styles,
			borderWidth: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...styles,
			borderWidth: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...styles,
			borderWidth: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...styles,
		borderWidth: `${ top } ${ right } ${ bottom } ${ left } `,
	};
}

/**
 * Update border-radius style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-radius values object.
 * @return {Object} New Styles object.
 */
export function updateBorderRadiusStyles( styles, values ) {
	delete styles.borderRadius;
	delete styles.borderTopLeftRadius;
	delete styles.borderTopRightRadius;
	delete styles.borderBottomRightRadius;
	delete styles.borderBottomLeftRadius;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues ) {
		return styles;
	}

	if ( typeof cleanValues !== 'object' && typeof cleanValues !== 'string' ) {
		return styles;
	}

	if ( typeof cleanValues === 'string' ) {
		return {
			...styles,
			borderRadius: toUnitVal( cleanValues ),
		};
	}

	const topLeft = toUnitVal( cleanValues.topLeft );
	const topRight = toUnitVal( cleanValues.topRight );
	const bottomRight = toUnitVal( cleanValues.bottomRight );
	const bottomLeft = toUnitVal( cleanValues.bottomLeft );

	if ( ! topLeft || ! topRight || ! bottomRight || ! bottomLeft ) {
		return {
			...styles,
			borderTopLeftRadius: topLeft,
			borderTopRightRadius: topRight,
			borderBottomRightRadius: bottomRight,
			borderBottomLeftRadius: bottomLeft,
		};
	}

	if ( topLeft === topRight && topLeft === bottomRight && topLeft === bottomLeft ) {
		return {
			...styles,
			borderRadius: topLeft,
		};
	} else if ( topLeft === bottomRight && topRight === bottomLeft ) {
		return {
			...styles,
			borderRadius: `${ topLeft } ${ topRight }`,
		};
	} else if ( topRight === bottomLeft ) {
		return {
			...styles,
			borderRadius: `${ topLeft } ${ topRight } ${ bottomRight }`,
		};
	}

	return {
		...styles,
		borderRadius: `${ topLeft } ${ topRight } ${ bottomRight } ${ bottomLeft }`,
	};
}

/**
 * Update border-style style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-style values object.
 * @return {Object} New Styles object.
 */
export function updateBorderStyleStyles( styles, values ) {
	delete styles.borderStyle;
	delete styles.borderTopStyle;
	delete styles.borderRightStyle;
	delete styles.borderBottomStyle;
	delete styles.borderLeftStyle;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const top = toUnitVal( cleanValues.top );
	const right = toUnitVal( cleanValues.right );
	const bottom = toUnitVal( cleanValues.bottom );
	const left = toUnitVal( cleanValues.left );

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...styles,
			borderTopStyle: top,
			borderRightStyle: right,
			borderBottomStyle: bottom,
			borderLeftStyle: left,
		};
	}

	if ( top === right && top === bottom && top === left ) {
		return {
			...styles,
			borderStyle: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...styles,
			borderStyle: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...styles,
			borderStyle: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...styles,
		borderTopStyle: top,
		borderRightStyle: right,
		borderBottomStyle: bottom,
		borderLeftStyle: left,
	};
}

/**
 * Update border-scoloryle style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-color values object.
 * @return {Object} New Styles object.
 */
export function updateBorderColorStyles( styles, values ) {
	delete styles.borderColor;
	delete styles.borderTopColor;
	delete styles.borderRightColor;
	delete styles.borderBottomColor;
	delete styles.borderLeftColor;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const top = toUnitVal( cleanValues.top );
	const right = toUnitVal( cleanValues.right );
	const bottom = toUnitVal( cleanValues.bottom );
	const left = toUnitVal( cleanValues.left );

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...styles,
			borderTopColor: top,
			borderRightColor: right,
			borderBottomColor: bottom,
			borderLeftColor: left,
		};
	}

	if ( top === right && top === bottom && top === left ) {
		return {
			...styles,
			borderColor: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...styles,
			borderColor: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...styles,
			borderColor: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...styles,
		borderTopColor: top,
		borderRightColor: right,
		borderBottomColor: bottom,
		borderLeftColor: left,
	};
}
