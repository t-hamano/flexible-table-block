/**
 * WordPress dependencies
 */
import { UNARYLIKE_TYPES } from '@babel/types';
import { __ } from '@wordpress/i18n';

import { alignLeft, alignRight, alignCenter } from '@wordpress/icons';

// Minimum height of create table preview.
export const PREVIEW_TABLE_HEIGHT_MIN = 200;

// Max col number of create table.
export const PREVIEW_TABLE_COL_MAX = 100;

// Max row number of create table.
export const PREVIEW_TABLE_ROW_MAX = 100;

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
		label: __( 'Share', 'flexible-table-block' ),
		value: 'collapse',
	},
	{
		label: __( 'Separate', 'flexible-table-block' ),
		value: 'separate',
	},
];

// Text alignment setting options.
export const ALIGNMENT_CONTROLS = [
	{
		icon: alignLeft,
		title: __( 'Align column left', 'flexible-table-block' ),
		value: 'left',
	},
	{
		icon: alignCenter,
		title: __( 'Align column center', 'flexible-table-block' ),
		value: 'center',
	},
	{
		icon: alignRight,
		title: __( 'Align column right', 'flexible-table-block' ),
		value: 'right',
	},
];

// ARIA-label of table cells.
export const CELL_ARIA_LABEL = {
	head: __( 'Header cell text', 'flexible-table-block' ),
	body: __( 'Body cell text', 'flexible-table-block' ),
	foot: __( 'Footer cell text', 'flexible-table-block' ),
};

// Placeholder of table sections.
export const SECTION_PLACEHOLDER = {
	head: __( 'Header label', 'flexible-table-block' ),
	foot: __( 'Footer label', 'flexible-table-block' ),
};

// Indicator icon options.
export const SIDES = [
	{
		label: __( 'Top', 'flexible-table-block' ),
		value: 'top',
	},
	{
		label: __( 'Right', 'flexible-table-block' ),
		value: 'right',
	},
	{
		label: __( 'Bottom', 'flexible-table-block' ),
		value: 'bottom',
	},
	{
		label: __( 'Left', 'flexible-table-block' ),
		value: 'left',
	},
];

export const CORNERS = [
	{
		label: __( 'Top Left', 'flexible-table-block' ),
		value: 'topLeft',
	},
	{
		label: __( 'Top Right', 'flexible-table-block' ),
		value: 'topRight',
	},
	{
		label: __( 'Bottom Right', 'flexible-table-block' ),
		value: 'bottomRight',
	},
	{
		label: __( 'Bottom Left', 'flexible-table-block' ),
		value: 'bottomLeft',
	},
];

// UnitControl Component units options.
export const FONT_SIZE_UNITS = [ 'px', 'em', 'rem', '%' ];
export const TABLE_WIDTH_UNITS = [ 'px', 'em', 'rem', '%' ];
export const BORDER_SPACING_UNITS = [ 'px', 'em', 'rem' ];
export const BORDER_WIDTH_UNITS = [ 'px', 'em', 'rem', '%' ];
export const BORDER_RADIUS_UNITS = [ 'px', 'em', 'rem', '%' ];
