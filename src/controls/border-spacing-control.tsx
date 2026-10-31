/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { BORDER_UNITS, MAX_BORDER_SPACING, DIRECTION_CONTROLS } from '../constants';
import LinkedUnitControl from './linked-unit-control';
import { DirectionIndicatorControl } from './indicator-control';

type Props = {
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	values: {
		horizontal?: string;
		vertical?: string;
	};
};

export default function BorderSpacingControl( {
	label = __( 'Border spacing', 'flexible-table-block' ),
	...props
}: Props ) {
	return (
		<LinkedUnitControl
			{ ...props }
			label={ label }
			className="ftb-border-spacing-control"
			items={ DIRECTION_CONTROLS }
			layout="directions"
			availableUnits={ BORDER_UNITS }
			maxValues={ MAX_BORDER_SPACING }
			indicator={ ( direction ) => <DirectionIndicatorControl direction={ direction } /> }
		/>
	);
}
