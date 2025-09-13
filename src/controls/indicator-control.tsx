/**
 * WordPress dependencies
 */
import {
	Icon,
	cornerTopLeft,
	cornerTopRight,
	cornerBottomRight,
	cornerBottomLeft,
	cornerAll,
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

export function CornerIndicatorControl( { corner }: { corner?: CornerValue } ) {
	if ( corner === 'topLeft' ) {
		return <Icon icon={ cornerTopLeft } />;
	}
	if ( corner === 'topRight' ) {
		return <Icon icon={ cornerTopRight } />;
	}
	if ( corner === 'bottomRight' ) {
		return <Icon icon={ cornerBottomRight } />;
	}
	if ( corner === 'bottomLeft' ) {
		return <Icon icon={ cornerBottomLeft } />;
	}
	return <Icon icon={ cornerAll } />;
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
