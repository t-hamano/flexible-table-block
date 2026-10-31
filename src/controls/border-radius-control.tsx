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
import { BORDER_UNITS, MAX_BORDER_RADIUS, CORNER_CONTROLS } from '../constants';
import LinkedUnitControl from './linked-unit-control';
import { CornerIndicatorControl } from './indicator-control';

type Props = {
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	values: {
		topLeft?: Property.BorderTopLeftRadius;
		topRight?: Property.BorderTopRightRadius;
		bottomRight?: Property.BorderBottomRightRadius;
		bottomLeft?: Property.BorderBottomLeftRadius;
	};
	className?: string;
};

export default function BorderRadiusControl( {
	label = __( 'Border radius', 'flexible-table-block' ),
	className,
	help,
	onChange,
	values,
}: Props ) {
	return (
		<LinkedUnitControl
			label={ label }
			help={ help }
			values={ values }
			onChange={ onChange }
			className={ clsx( 'ftb-border-radius-control', className ) }
			items={ CORNER_CONTROLS }
			layout="corners"
			availableUnits={ BORDER_UNITS }
			maxValues={ MAX_BORDER_RADIUS }
			indicator={ ( corner ) => <CornerIndicatorControl corner={ corner } /> }
		/>
	);
}
