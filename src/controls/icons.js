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

// Icon showing active sides.
export function SideControlIcon( { sides } ) {
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

// Icon showing active corners.
export function CornerControlIcon( { corners } ) {
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
