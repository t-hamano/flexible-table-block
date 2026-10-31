/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PADDING_UNITS, SIDE_CONTROLS } from '../constants';
import LinkedUnitControl from './linked-unit-control';
import { SideIndicatorControl } from './indicator-control';

type Props = {
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	values: {
		top?: Property.PaddingTop;
		right?: Property.PaddingRight;
		bottom?: Property.PaddingBottom;
		left?: Property.PaddingLeft;
	};
	className?: string;
};

export default function PaddingControl( {
	label = __( 'Padding', 'flexible-table-block' ),
	className,
	...props
}: Props ) {
	return (
		<LinkedUnitControl
			{ ...props }
			label={ label }
			className={ clsx( 'ftb-padding-control', className ) }
			items={ SIDE_CONTROLS }
			layout="sides"
			availableUnits={ PADDING_UNITS }
			indicator={ ( side ) => <SideIndicatorControl side={ side } /> }
		/>
	);
}
