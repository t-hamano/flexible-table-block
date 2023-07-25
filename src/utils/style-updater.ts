/**
 * External dependencies
 */
import type { Properties } from 'csstype';

/**
 * Internal dependencies
 */
import { pickBy, mapValues } from 'lodash';
import { sanitizeUnitValue } from './helper';
import type { CornerProps, DirectionProps } from './style-picker';

function getCssPropertyWithFourDirection(
	property: keyof Properties,
	top: string,
	right: string,
	bottom: string,
	left: string
): Properties {
	if ( top === right && top === bottom && top === left ) {
		return {
			[ property ]: top,
		};
	}

	if ( top === bottom && left === right ) {
		return {
			[ property ]: `${ top } ${ left }`,
		};
	}

	if ( left === right ) {
		return {
			[ property ]: `${ top } ${ left } ${ bottom }`,
		};
	}

	return {
		[ property ]: `${ top } ${ right } ${ bottom } ${ left }`,
	};
}

/**
 * Update padding style of styles object.
 *
 * @param styles Styles object.
 * @param values padding values object.
 * @return  New Styles object.
 */
export function updatePadding(
	styles: Properties,
	values: Partial< DirectionProps > | undefined
): Properties {
	if ( ! values ) return styles;

	const { top, right, bottom, left } = mapValues( pickBy( values ), ( value ) =>
		sanitizeUnitValue( value )
	);
	const newPaddingValues = {
		paddingTop: top,
		paddingRight: right,
		paddingBottom: bottom,
		paddingLeft: left,
	};

	const { padding, paddingTop, paddingRight, paddingBottom, paddingLeft, ...newStyles } = styles;

	if ( ! top || ! right || ! bottom || ! right ) {
		return pickBy( {
			...newStyles,
			...newPaddingValues,
		} );
	}

	return {
		...newStyles,
		...getCssPropertyWithFourDirection( 'padding', top, right, bottom, left ),
	};
}

/**
 * Update border-width style of styles object.
 *
 * @param styles Styles object.
 * @param values border-width values object.
 * @return  New Styles object.
 */
export function updateBorderWidth(
	styles: Properties,
	values: Partial< DirectionProps > | undefined
): Properties {
	if ( ! values ) return styles;

	const { top, right, bottom, left } = mapValues( pickBy( values ), ( value ) =>
		sanitizeUnitValue( value )
	);

	const newBorderWidthValues = {
		borderTopWidth: top,
		borderRightWidth: right,
		borderBottomWidth: bottom,
		borderLeftWidth: left,
	};

	const {
		borderWidth,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		...newStyles
	} = styles;

	if ( ! top || ! right || ! bottom || ! right ) {
		return pickBy( {
			...newStyles,
			...newBorderWidthValues,
		} );
	}

	return {
		...newStyles,
		...getCssPropertyWithFourDirection( 'borderWidth', top, right, bottom, left ),
	};
}

/**
 * Update border-style style of styles object.
 *
 * @param styles Styles object.
 * @param values border-style values object.
 * @return New Styles object.
 */
export function updateBorderStyle(
	styles: Properties,
	values: Partial< DirectionProps > | undefined
): Properties {
	if ( ! values ) return styles;

	const { top, right, bottom, left } = pickBy( values );
	const newBorderStyleValues = {
		borderTopStyle: top,
		borderRightStyle: right,
		borderBottomStyle: bottom,
		borderLeftStyle: left,
	};

	const {
		borderStyle,
		borderTopStyle,
		borderRightStyle,
		borderBottomStyle,
		borderLeftStyle,
		...newStyles
	} = styles;

	if ( ! top || ! right || ! bottom || ! right ) {
		return pickBy( {
			...newStyles,
			...newBorderStyleValues,
		} );
	}

	return {
		...newStyles,
		...getCssPropertyWithFourDirection( 'borderStyle', top, right, bottom, left ),
	};
}

/**
 * Update border-scoloryle style of styles object.
 *
 * @param styles Styles object.
 * @param values border-color values object.
 * @return New Styles object.
 */
export function updateBorderColor(
	styles: Properties,
	values: Partial< DirectionProps > | undefined
): Properties {
	if ( ! values ) return styles;

	const { top, right, bottom, left } = pickBy( values );
	const newBorderColorValues = {
		borderTopColor: top,
		borderRightColor: right,
		borderBottomColor: bottom,
		borderLeftColor: left,
	};

	const {
		borderColor,
		borderTopColor,
		borderRightColor,
		borderBottomColor,
		borderLeftColor,
		...newStyles
	} = styles;

	if ( ! top || ! right || ! bottom || ! right ) {
		return pickBy( {
			...newStyles,
			...newBorderColorValues,
		} );
	}

	return {
		...newStyles,
		...getCssPropertyWithFourDirection( 'borderColor', top, right, bottom, left ),
	};
}

/**
 * Update border-spacing style of styles object.
 *
 * @param styles            Styles object.
 * @param values            border-spacing values object.
 * @param values.horizontal
 * @param values.vertical
 * @return New Styles object.
 */
export function updateBorderSpacing(
	styles: Properties,
	values: { horizontal?: string; vertical?: string } | undefined
): Properties {
	if ( ! values ) return styles;

	const { borderSpacing, ...newStyles } = styles;
	const { horizontal, vertical } = mapValues( pickBy( values ), ( value ) =>
		sanitizeUnitValue( value )
	);

	if ( horizontal === undefined && vertical === undefined ) {
		return newStyles;
	}
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
 * Update border-radius style of styles object.
 *
 * @param styles Styles object.
 * @param values border-radius values object.
 * @return  New Styles object.
 */
export function updateBorderRadius(
	styles: Properties,
	values: Partial< CornerProps > | undefined
): Properties {
	if ( ! values ) return styles;

	const { topLeft, topRight, bottomRight, bottomLeft } = mapValues( pickBy( values ), ( value ) =>
		sanitizeUnitValue( value )
	);

	const newBorderRadiusValues = {
		borderTopLeftRadius: topLeft,
		borderTopRightRadius: topRight,
		borderBottomRightRadius: bottomRight,
		borderBottomLeftRadius: bottomLeft,
	};

	const {
		borderRadius,
		borderTopLeftRadius,
		borderTopRightRadius,
		borderBottomRightRadius,
		borderBottomLeftRadius,
		...newStyles
	} = styles;

	if ( ! topLeft || ! topRight || ! bottomRight || ! bottomLeft ) {
		return pickBy( {
			...newStyles,
			...newBorderRadiusValues,
		} );
	}

	return {
		...newStyles,
		...getCssPropertyWithFourDirection(
			'borderRadius',
			topLeft,
			topRight,
			bottomRight,
			bottomLeft
		),
	};
}
