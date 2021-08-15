/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	alignLeft,
	alignRight,
	alignCenter
} from '@wordpress/icons';

export const BORDER_SPACING_MAX = 100;

export const ALIGNMENT_CONTROLS = [
	{
		icon: alignLeft,
		title: __( 'Align column left', 'flexible-spacer-block' ),
		align: 'left'
	},
	{
		icon: alignCenter,
		title: __( 'Align column center', 'flexible-spacer-block' ),
		align: 'center'
	},
	{
		icon: alignRight,
		title: __( 'Align column right', 'flexible-spacer-block' ),
		align: 'right'
	}
];

export const STICKY_CONTROLS = [
	{
		label: __( 'none', 'flexible-spacer-block' ),
		value: null
	},
	{
		label: __( 'Fixed header', 'flexible-spacer-block' ),
		value: 'header'
	},
	{
		label: __( 'Fixed first column', 'flexible-spacer-block' ),
		value: 'first-column'
	}
];

export const BORDER_COLLAPSE_CONTROLS = [
	{
		label: __( 'Share', 'flexible-spacer-block' ),
		value: 'collapse'
	},
	{
		label: __( 'Separate', 'flexible-spacer-block' ),
		value: 'separate'
	}
];

export const CELL_ARIA_LABEL = {
	head: __( 'Header cell text', 'flexible-spacer-block' ),
	body: __( 'Body cell text', 'flexible-spacer-block' ),
	foot: __( 'Footer cell text', 'flexible-spacer-block' )
};

export const SECTION_PLACEHOLDER = {
	head: __( 'Header label', 'flexible-spacer-block' ),
	foot: __( 'Footer label', 'flexible-spacer-block' )
};
