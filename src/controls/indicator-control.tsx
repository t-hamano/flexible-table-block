/**
 * WordPress dependencies
 */
import {
	Icon,
	sidesAll,
	sidesBottom,
	sidesLeft,
	sidesRight,
	sidesTop,
	sidesHorizontal,
	sidesVertical,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	ViewBox,
	TopLeftStroke,
	TopRightStroke,
	BottomRightStroke,
	BottomLeftStroke,
} from './styles';
import type { SideValue, CornerValue, DirectionValue } from '../BlockAttributes';

export function SideIndicatorControl( { side }: { side?: SideValue } ) {
	if ( side === 'top' ) {
		return <Icon icon={ sidesTop } />;
	}
	if ( side === 'right' ) {
		return <Icon icon={ sidesRight } />;
	}
	if ( side === 'bottom' ) {
		return <Icon icon={ sidesBottom } />;
	}
	if ( side === 'left' ) {
		return <Icon icon={ sidesLeft } />;
	}
	return <Icon icon={ sidesAll } />;
}

export function CornerIndicatorControl( { corners }: { corners?: CornerValue[] } ) {
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

export function DirectionIndicatorControl( { direction }: { direction?: DirectionValue } ) {
	if ( direction === 'horizontal' ) {
		return <Icon icon={ sidesHorizontal } />;
	}
	if ( direction === 'vertical' ) {
		return <Icon icon={ sidesVertical } />;
	}
	return <Icon icon={ sidesAll } />;
}
