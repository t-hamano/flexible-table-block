/**
 * External dependencies
 */
import type { Properties } from 'csstype';

/**
 * Internal dependencies
 */
import { cleanEmptyObject } from './helper';
import {
	BORDER_COLOR_STYLE,
	BORDER_RADIUS_STYLE,
	BORDER_STYLE_STYLE,
	BORDER_WIDTH_STYLE,
	PADDING_STYLE,
} from './style-picker';
import type { CornerProps, CrossProps, DirectionProps, FourSideStyle } from './style-picker';

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
 * Update a four-side style of styles object.
 *
 * If all four values are set, the shorthand property is used. Otherwise, only the set values are
 * output as longhand properties.
 *
 * @param styles                  Styles object.
 * @param values                  Four-side values object.
 * @param fourSideStyle           Four-side style definition.
 * @param fourSideStyle.shorthand Shorthand CSS property name.
 * @param fourSideStyle.longhands Map of each side to its longhand CSS property name.
 * @return New Styles object.
 */
function updateFourSides< K extends string >(
	styles: Properties,
	values: Partial< Record< K, string > > | undefined,
	{ shorthand, longhands }: FourSideStyle< K >
): Properties {
	if ( ! values ) {
		return styles;
	}

	const sides = Object.keys( longhands ) as K[];
	const longhandNames = sides.map( ( side ) => longhands[ side ] );
	const newStyles = Object.fromEntries(
		Object.entries( styles ).filter(
			( [ property ] ) =>
				property !== shorthand && ! longhandNames.includes( property as keyof Properties )
		)
	) as Properties;
	const sideValues = sides.map( ( side ) => values[ side ] || undefined );

	if ( sideValues.some( ( value ) => ! value ) ) {
		return {
			...newStyles,
			...cleanEmptyObject(
				Object.fromEntries(
					longhandNames.map( ( property, index ) => [ property, sideValues[ index ] ] )
				)
			),
		};
	}

	const [ top, right, bottom, left ] = sideValues as string[];

	return {
		...newStyles,
		...getCssPropertyWithFourDirection( shorthand, top, right, bottom, left ),
	};
}

/**
 * Update padding style of styles object.
 *
 * @param styles Styles object.
 * @param values padding values object.
 * @return New Styles object.
 */
export function updatePadding(
	styles: Properties,
	values: Partial< DirectionProps > | undefined
): Properties {
	return updateFourSides( styles, values, PADDING_STYLE );
}

/**
 * Update border-width style of styles object.
 *
 * @param styles Styles object.
 * @param values border-width values object.
 * @return New Styles object.
 */
export function updateBorderWidth(
	styles: Properties,
	values: Partial< DirectionProps > | undefined
): Properties {
	return updateFourSides( styles, values, BORDER_WIDTH_STYLE );
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
	return updateFourSides( styles, values, BORDER_STYLE_STYLE );
}

/**
 * Update border-color style of styles object.
 *
 * @param styles Styles object.
 * @param values border-color values object.
 * @return New Styles object.
 */
export function updateBorderColor(
	styles: Properties,
	values: Partial< DirectionProps > | undefined
): Properties {
	return updateFourSides( styles, values, BORDER_COLOR_STYLE );
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
	values: Partial< CrossProps > | undefined
): Properties {
	if ( ! values ) {
		return styles;
	}

	const { borderSpacing, ...newStyles } = styles;

	const horizontal = values.horizontal || '';
	const vertical = values.vertical || '';

	if ( ! horizontal && ! vertical ) {
		return newStyles;
	}

	if ( ! horizontal || ! vertical ) {
		return {
			...newStyles,
			borderSpacing: `${ horizontal || '0' } ${ vertical || '0' }`,
		};
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
 * @return New Styles object.
 */
export function updateBorderRadius(
	styles: Properties,
	values: Partial< CornerProps > | undefined
): Properties {
	return updateFourSides( styles, values, BORDER_RADIUS_STYLE );
}
