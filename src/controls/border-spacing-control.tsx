/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { BORDER_UNITS, MAX_BORDER_SPACING, DIRECTION_CONTROLS } from '../constants';
import LinkedUnitControl from './linked-unit-control';

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
			className="ftb-border-spacing-control"
			items={ DIRECTION_CONTROLS }
			layout="directions"
			availableUnits={ BORDER_UNITS }
			maxValues={ MAX_BORDER_SPACING }
		/>
	);
}
