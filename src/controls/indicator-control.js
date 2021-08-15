/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	ViewBox,
	TopStroke,
	RightStroke,
	BottomStroke,
	LeftStroke,
	TopLeftStroke,
	TopRightStroke,
	BottomRightStroke,
	BottomLeftStroke,
} from './styles';

export const SIDES = [
	{
		label: __( 'Top', 'flexible-table-block' ),
		value: 'top',
	},
	{
		label: __( 'Right', 'flexible-table-block' ),
		value: 'right',
	},
	{
		label: __( 'Bottom', 'flexible-table-block' ),
		value: 'bottom',
	},
	{
		label: __( 'Left', 'flexible-table-block' ),
		value: 'left',
	},
];

export const CORNERS = [
	{
		label: __( 'Top Left', 'flexible-table-block' ),
		value: 'topLeft',
	},
	{
		label: __( 'Top Right', 'flexible-table-block' ),
		value: 'topRight',
	},
	{
		label: __( 'Bottom Right', 'flexible-table-block' ),
		value: 'bottomRight',
	},
	{
		label: __( 'Bottom Left', 'flexible-table-block' ),
		value: 'bottomLeft',
	},
];

export const DIRECTIONS = [
	{
		label: __( 'Horizontal', 'flexible-table-block' ),
		value: 'horizontal',
	},
	{
		label: __( 'Vertical', 'flexible-table-block' ),
		value: 'vertical',
	},
];

export function SideIndicatorControl( { sides } ) {
	const top = ! sides || sides.includes( 'top' );
	const right = ! sides || sides.includes( 'right' );
	const bottom = ! sides || sides.includes( 'bottom' );
	const left = ! sides || sides.includes( 'left' );

	return (
		<ViewBox>
			<TopStroke isFocused={ top } />
			<RightStroke isFocused={ right } />
			<BottomStroke isFocused={ bottom } />
			<LeftStroke isFocused={ left } />
		</ViewBox>
	);
}

export function CornerIndicatorControl( { corners } ) {
	const topLeft = ! corners || corners.includes( 'topLeft' );
	const topRight = ! corners || corners.includes( 'topRight' );
	const bottomRight = ! corners || corners.includes( 'bottomRight' );
	const bottomLeft = ! corners || corners.includes( 'bottomLeft' );

	return (
		<ViewBox>
			<TopLeftStroke isFocused={ topLeft } />
			<TopRightStroke isFocused={ topRight } />
			<BottomRightStroke isFocused={ bottomRight } />
			<BottomLeftStroke isFocused={ bottomLeft } />
		</ViewBox>
	);
}

export function DirectionIndicatorControl( { directions } ) {
	const horizontal = ! directions || directions.includes( 'horizontal' );
	const vertical = ! directions || directions.includes( 'vertical' );

	return (
		<ViewBox>
			<TopStroke isFocused={ vertical } />
			<RightStroke isFocused={ horizontal } />
			<BottomStroke isFocused={ vertical } />
			<LeftStroke isFocused={ horizontal } />
		</ViewBox>
	);
}
