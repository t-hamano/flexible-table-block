/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { borderCollapse, borderSeparate } from './icons';

// Collection of available units.
export const TABLE_WIDTH_UNITS = [ 'px', 'em', 'rem', '%' ];
export const BORDER_SPACING_UNITS = [ 'px', 'em', 'rem' ];
export const FONT_SIZE_UNITS = [ 'px', 'em', 'rem', '%' ];

// Fixed control setting options.
export const STICKY_CONTROLS = [
	{
		label: __( 'none', 'flexible-table-block' ),
		value: 'none',
	},
	{
		label: __( 'Fixed header', 'flexible-table-block' ),
		value: 'header',
	},
	{
		label: __( 'Fixed first column', 'flexible-table-block' ),
		value: 'first-column',
	},
];

// Cell borders setting options.
export const BORDER_COLLAPSE_CONTROLS = [
	{
		icon: borderCollapse,
		label: __( 'Share', 'flexible-table-block' ),
		value: 'collapse',
	},
	{
		icon: borderSeparate,
		label: __( 'Separate', 'flexible-table-block' ),
		value: 'separate',
	},
];

// Text alignment setting options.
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
