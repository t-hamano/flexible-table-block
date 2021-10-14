/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	alignTop,
	alignMiddle,
	alignBottom,
	borderSolid,
	borderDotted,
	borderDashed,
	borderDouble,
	borderCollapse as borderCollapseIcon,
	borderSeparate as borderSeparateIcon,
} from './icons';

// Custom store name.
export const STORE_NAME = 'flexible-table-block';

// Rest API routes.
export const REST_API_ROUTE = '/flexible-table-block/v1/options';

// Upper and lower limits and thresholds.
export const MIN_PREVIEW_TABLE_HEIGHT = 150;
export const MAX_PREVIEW_TABLE_COL = 50;
export const MAX_PREVIEW_TABLE_ROW = 50;
export const THRESHOLD_PREVIEW_TABLE_COL = 10;
export const THRESHOLD_PREVIEW_TABLE_ROW = 10;

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

export const MAX_BORDER_SPACING = {
	px: 100,
	em: 20,
	rem: 20,
};

// Responsive breakpoint settings.
export const DEFAULT_RESPONSIVE_BREAKPOINT = 768;
export const MIN_RESPONSIVE_BREAKPOINT = 200;
export const MAX_RESPONSIVE_BREAKPOINT = 1200;

// Available units on UnitControl component.
export const FONT_SIZE_UNITS = [ 'px', 'em', 'rem', '%' ];
export const TABLE_WIDTH_UNITS = [ 'px', 'em', 'rem', '%' ];
export const CELL_WIDTH_UNITS = [ 'px', 'em', 'rem', '%' ];
export const BORDER_SPACING_UNITS = [ 'px', 'em', 'rem' ];
export const BORDER_RADIUS_UNITS = [ 'px', 'em', 'rem' ];
export const BORDER_WIDTH_UNITS = [ 'px', 'em', 'rem' ];
export const PADDING_UNITS = [ 'px', '%', 'em', 'rem', 'vw', 'vh' ];

// Label & Text variations.
export const CELL_ARIA_LABEL = {
	head: __( 'Header cell text', 'flexible-table-block' ),
	body: __( 'Body cell text', 'flexible-table-block' ),
	foot: __( 'Footer cell text', 'flexible-table-block' ),
};

// Controls variations.
export const BORDER_COLLAPSE_CONTROLS = [
	{
		icon: borderCollapseIcon,
		label: __( 'Share', 'flexible-table-block' ),
		value: 'collapse',
	},
	{
		icon: borderSeparateIcon,
		label: __( 'Separate', 'flexible-table-block' ),
		value: 'separate',
	},
];

export const BORDER_STYLE_CONTROLS = [
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

export const TEXT_ALIGNMENT_CONTROLS = [
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

export const VERTICAL_ALIGNMENT_CONTROLS = [
	{
		icon: alignTop,
		label: __( 'Align top', 'flexible-table-block' ),
		value: 'top',
	},
	{
		icon: alignMiddle,
		label: __( 'Align middle', 'flexible-table-block' ),
		value: 'middle',
	},
	{
		icon: alignBottom,
		label: __( 'Align bottom', 'flexible-table-block' ),
		value: 'bottom',
	},
];

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

export const CELL_TAG_CONTROLS = [
	{
		label: __( 'TH', 'flexible-table-block' ),
		value: 'th',
	},
	{
		label: __( 'TD', 'flexible-table-block' ),
		value: 'td',
	},
];

export const CAPTION_SIDE_CONTROLS = [
	{
		label: __( 'Top', 'flexible-table-block' ),
		value: 'top',
	},
	{
		label: __( 'Bottom', 'flexible-table-block' ),
		value: 'bottom',
	},
];
