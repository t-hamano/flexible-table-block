/**
 * External dependencies
 */
import type { Properties } from 'csstype';

/**
 * Internal dependencies
 */
import { parseCssValue } from './helper';

export interface DirectionProps {
	top: string;
	right: string;
	bottom: string;
	left: string;
}

export interface CornerProps {
	topLeft: string;
	topRight: string;
	bottomRight: string;
	bottomLeft: string;
}

export interface CrossProps {
	horizontal: string;
	vertical: string;
}

/**
 * Definition of a four-side style: the shorthand CSS property and the longhand CSS property of each
 * side (or corner), in the same order as the shorthand.
 */
export interface FourSideStyle< K extends string > {
	shorthand: keyof Properties;
	longhands: Record< K, keyof Properties >;
}

export const PADDING_STYLE: FourSideStyle< keyof DirectionProps > = {
	shorthand: 'padding',
	longhands: {
		top: 'paddingTop',
		right: 'paddingRight',
		bottom: 'paddingBottom',
		left: 'paddingLeft',
	},
};

export const BORDER_WIDTH_STYLE: FourSideStyle< keyof DirectionProps > = {
	shorthand: 'borderWidth',
	longhands: {
		top: 'borderTopWidth',
		right: 'borderRightWidth',
		bottom: 'borderBottomWidth',
		left: 'borderLeftWidth',
	},
};

export const BORDER_STYLE_STYLE: FourSideStyle< keyof DirectionProps > = {
	shorthand: 'borderStyle',
	longhands: {
		top: 'borderTopStyle',
		right: 'borderRightStyle',
		bottom: 'borderBottomStyle',
		left: 'borderLeftStyle',
	},
};

export const BORDER_COLOR_STYLE: FourSideStyle< keyof DirectionProps > = {
	shorthand: 'borderColor',
	longhands: {
		top: 'borderTopColor',
		right: 'borderRightColor',
		bottom: 'borderBottomColor',
		left: 'borderLeftColor',
	},
};

export const BORDER_RADIUS_STYLE: FourSideStyle< keyof CornerProps > = {
	shorthand: 'borderRadius',
	longhands: {
		topLeft: 'borderTopLeftRadius',
		topRight: 'borderTopRightRadius',
		bottomRight: 'borderBottomRightRadius',
		bottomLeft: 'borderBottomLeftRadius',
	},
};

/**
 * Pick a four-side style as object from style object.
 *
 * @param stylesObj               styles object.
 * @param fourSideStyle           Four-side style definition.
 * @param fourSideStyle.shorthand Shorthand CSS property name.
 * @param fourSideStyle.longhands Map of each side to its longhand CSS property name.
 * @return Four-side styles object.
 */
export function pickFourSides< K extends string >(
	stylesObj: Properties,
	{ shorthand, longhands }: FourSideStyle< K >
): Record< K, string > {
	const sides = Object.keys( longhands ) as K[];
	const shorthandValue = stylesObj[ shorthand ];
	const values = shorthandValue
		? parseCssValue( String( shorthandValue ) )
		: sides.map( ( side ) => String( stylesObj[ longhands[ side ] ] || '' ) );

	return Object.fromEntries( sides.map( ( side, index ) => [ side, values[ index ] ] ) ) as Record<
		K,
		string
	>;
}

/**
 * Pick border-spacing style as object from style object.
 *
 * @param stylesObj styles object.
 * @return border-spacing styles object.
 */
export function pickBorderSpacing( stylesObj: Properties ): CrossProps {
	const borderSpacingValues = parseCssValue( stylesObj.borderSpacing || '' );

	return {
		horizontal: borderSpacingValues[ 0 ],
		vertical: borderSpacingValues[ 1 ],
	};
}
