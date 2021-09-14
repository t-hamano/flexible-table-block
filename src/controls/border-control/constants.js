/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { borderSolid, borderDotted, borderDashed, borderDouble } from './icons';

// Collection of available units.
export const BORDER_WIDTH_UNITS = [ 'px', 'em', 'rem' ];
export const BORDER_RADIUS_UNITS = [ 'px', 'em', 'rem' ];

// Upper or lower limits for settings.
export const MAX_BORDER_RADIUS = {
	px: 100,
	em: 20,
	rem: 20,
};

export const MAX_BORDER_WIDTH = {
	px: 100,
	em: 20,
	rem: 20,
};

// Border Style setting options.
export const BORDER_STYLES = [
	{
		label: __( 'Solid', 'flexible-table-block' ),
		value: 'solid',
		icon: borderSolid,
	},
	{
		label: __( 'Dotted', 'flexible-table-block' ),
		value: 'dotted',
		icon: borderDotted,
	},
	{
		label: __( 'Dashed', 'flexible-table-block' ),
		value: 'dashed',
		icon: borderDashed,
	},
	{
		label: __( 'Double', 'flexible-table-block' ),
		value: 'double',
		icon: borderDouble,
	},
];
