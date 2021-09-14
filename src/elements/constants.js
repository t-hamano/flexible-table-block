/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

// Upper or lower limits for settings.
export const MIN_PREVIEW_TABLE_HEIGHT = 200;
export const MAX_PREVIEW_TABLE_COL = 50;
export const MAX_PREVIEW_TABLE_ROW = 50;
export const THRESHOLD_PREVIEW_TABLE_COL = 10;
export const THRESHOLD_PREVIEW_TABLE_ROW = 10;

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
