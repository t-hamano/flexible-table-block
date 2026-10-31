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
import { BORDER_UNITS, MAX_BORDER_WIDTH, SIDE_CONTROLS } from '../constants';
import LinkedUnitControl from './linked-unit-control';
import { SideIndicatorControl } from './indicator-control';

type Props = {
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	values: {
		top?: Property.BorderTopWidth;
		right?: Property.BorderRightWidth;
		bottom?: Property.BorderBottomWidth;
		left?: Property.BorderLeftWidth;
	};
	allowSides?: boolean;
	hasIndicator?: boolean;
	className?: string;
};

export default function BorderWidthControl( {
	label = __( 'Border width', 'flexible-table-block' ),
	allowSides = true,
	hasIndicator = true,
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
			className={ clsx( 'ftb-border-width-control', className ) }
			items={ SIDE_CONTROLS }
			layout="sides"
			availableUnits={ BORDER_UNITS }
			maxValues={ MAX_BORDER_WIDTH }
			indicator={ hasIndicator ? ( side ) => <SideIndicatorControl side={ side } /> : undefined }
			allowUnlink={ allowSides }
		/>
	);
}
