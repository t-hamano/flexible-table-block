/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';

export const FONT_SIZE_UNITS = [ 'px', 'em', 'rem', '%' ];

export const ALIGNMENT_CONTROLS = [
	{
		icon: alignLeft,
		label: __( 'Align left', 'flexible-table-block' ),
		value: 'left',
	},
	{
		icon: alignCenter,
		label: __( 'Align center', 'flexible-table-block' ),
		value: 'center',
	},
	{
		icon: alignRight,
		label: __( 'Align right', 'flexible-table-block' ),
		value: 'right',
	},
];
