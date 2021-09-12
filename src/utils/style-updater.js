/**
 * Internal dependencies
 */
import { cleanEmptyObject } from './utils/helper';

/**
 * Update border-spacing style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-spacing styles object.
 * @return {Object} New Styles object.
 */
export function updateBorderSpacing( styles, values ) {
	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}
	const { top, left } = cleanValues;

	if ( top === left ) {
		return {
			...styles,
			borderSpacing: values.top,
		};
	}

	return {
		...styles,
		borderSpacing: `${ values.left } ${ values.top }`,
	};
}

/**
 * Update border-width style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-width styles object.
 * @return {Object} New Styles object.
 */
export function updateBorderWidth( styles, values ) {
	delete styles.borderWidth;
	delete styles.borderTopWidth;
	delete styles.borderRightWidth;
	delete styles.borderBottomWidth;
	delete styles.borderLeftWidth;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...styles,
			borderTopWidth: top,
			borderRightWidth: right,
			borderBottomWidth: bottom,
			borderLeftWidth: left,
		};
	}

	if ( top === right && top === bottom && top === right ) {
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
		borderTopWidth: top,
		borderRightWidth: right,
		borderBottomWidth: bottom,
		borderLeftWidth: left,
	};
}

/**
 * Update border-radius style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-radius styles object.
 * @return {Object} New Styles object.
 */
export function updateBorderRadius( styles, values ) {
	delete styles.borderRadius;
	delete styles.borderTopLeftRadius;
	delete styles.borderTopRightRadius;
	delete styles.borderBottomRightRadius;
	delete styles.borderBottomLeftRadius;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...styles,
			borderTopLeftRadius: top,
			borderTopRightRadius: right,
			borderBottomRightRadius: bottom,
			borderBottomLeftRadius: left,
		};
	}

	if ( top === right && top === bottom && top === right ) {
		return {
			...styles,
			borderRadius: top,
		};
	} else if ( top === bottom && left === right ) {
		return {
			...styles,
			borderRadius: `${ top } ${ left }`,
		};
	} else if ( left === right ) {
		return {
			...styles,
			borderRadius: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		...styles,
		borderTopLeftRadius: top,
		borderTopRightRadius: right,
		borderBottomRightRadius: bottom,
		borderBottomLeftRadius: left,
	};
}

/**
 * Update border-style style of styles object.
 *
 * @param {Object} styles Styles object.
 * @param {Object} values border-style styles object.
 * @return {Object} New Styles object.
 */
export function updateBorderStyle( styles, values ) {
	delete styles.borderStyle;
	delete styles.borderTopStyle;
	delete styles.borderRightStyle;
	delete styles.borderBottomStyle;
	delete styles.borderLeftStyle;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...styles,
			borderTopStyle: top,
			borderRightStyle: right,
			borderBottomStyle: bottom,
			borderLeftStyle: left,
		};
	}

	if ( top === right && top === bottom && top === right ) {
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
 * @param {Object} values border-color styles object.
 * @return {Object} New Styles object.
 */
export function updateBorderColor( styles, values ) {
	delete styles.borderColor;
	delete styles.borderTopColor;
	delete styles.borderRightColor;
	delete styles.borderBottomColor;
	delete styles.borderLeftColor;

	const cleanValues = cleanEmptyObject( values );

	if ( ! cleanValues || typeof cleanValues !== 'object' ) {
		return styles;
	}

	const { top, right, bottom, left } = cleanValues;

	if ( ! top || ! right || ! bottom || ! right ) {
		return {
			...styles,
			borderTopColor: top,
			borderRightColor: right,
			borderBottomColor: bottom,
			borderLeftColor: left,
		};
	}

	if ( top === right && top === bottom && top === right ) {
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
