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
 * Map of each side (or corner) to its longhand CSS property, in the same order as the shorthand.
 */
export type FourSideLonghands< T > = Record< keyof T & string, keyof Properties >;

export const PADDING_LONGHANDS: FourSideLonghands< DirectionProps > = {
	top: 'paddingTop',
	right: 'paddingRight',
	bottom: 'paddingBottom',
	left: 'paddingLeft',
};

export const BORDER_WIDTH_LONGHANDS: FourSideLonghands< DirectionProps > = {
	top: 'borderTopWidth',
	right: 'borderRightWidth',
	bottom: 'borderBottomWidth',
	left: 'borderLeftWidth',
};

export const BORDER_STYLE_LONGHANDS: FourSideLonghands< DirectionProps > = {
	top: 'borderTopStyle',
	right: 'borderRightStyle',
	bottom: 'borderBottomStyle',
	left: 'borderLeftStyle',
};

export const BORDER_COLOR_LONGHANDS: FourSideLonghands< DirectionProps > = {
	top: 'borderTopColor',
	right: 'borderRightColor',
	bottom: 'borderBottomColor',
	left: 'borderLeftColor',
};

export const BORDER_RADIUS_LONGHANDS: FourSideLonghands< CornerProps > = {
	topLeft: 'borderTopLeftRadius',
	topRight: 'borderTopRightRadius',
	bottomRight: 'borderBottomRightRadius',
	bottomLeft: 'borderBottomLeftRadius',
};

/**
 * Pick a four-side style as object from style object.
 *
 * @param stylesObj styles object.
 * @param shorthand Shorthand CSS property name.
 * @param longhands Map of each side to its longhand CSS property name.
 * @return Four-side styles object.
 */
function pickFourSides< K extends string >(
	stylesObj: Properties,
	shorthand: keyof Properties,
	longhands: Record< K, keyof Properties >
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
 * Pick padding style as object from style object.
 *
 * @param stylesObj styles object.
 * @return padding styles object.
 */
export function pickPadding( stylesObj: Properties ): DirectionProps {
	return pickFourSides( stylesObj, 'padding', PADDING_LONGHANDS );
}

/**
 * Pick border-width style as object from style object.
 *
 * @param stylesObj styles object.
 * @return border-width styles object.
 */
export function pickBorderWidth( stylesObj: Properties ): DirectionProps {
	return pickFourSides( stylesObj, 'borderWidth', BORDER_WIDTH_LONGHANDS );
}

/**
 * Pick border-color style as object from style object.
 *
 * @param stylesObj styles object.
 * @return border-color styles object.
 */
export function pickBorderColor( stylesObj: Properties ): DirectionProps {
	return pickFourSides( stylesObj, 'borderColor', BORDER_COLOR_LONGHANDS );
}

/**
 * Pick border-style style as object from style object.
 *
 * @param stylesObj styles object.
 * @return border-style styles object.
 */
export function pickBorderStyle( stylesObj: Properties ): DirectionProps {
	return pickFourSides( stylesObj, 'borderStyle', BORDER_STYLE_LONGHANDS );
}

/**
 * Pick border-radius style as object from style object.
 *
 * @param stylesObj styles object.
 * @return border-radius styles object.
 */
export function pickBorderRadius( stylesObj: Properties ): CornerProps {
	return pickFourSides( stylesObj, 'borderRadius', BORDER_RADIUS_LONGHANDS );
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
