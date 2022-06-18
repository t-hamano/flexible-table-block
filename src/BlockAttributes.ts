/**
 * Internal dependencies
 */
import type {
	STICKY_CONTROLS,
	CAPTION_SIDE_CONTROLS,
	CELL_TAG_CONTROLS,
	CELL_SCOPE_CONTROLS,
	TEXT_ALIGNMENT_CONTROLS,
	VERTICAL_ALIGNMENT_CONTROLS,
	CORNER_CONTROLS,
	DIRECTION_CONTROLS,
	SIDE_CONTROLS,
	BORDER_STYLE_CONTROLS,
	CONTENT_JUSTIFY_CONTROLS,
	BORDER_COLLAPSE_CONTROLS,
} from './constants';

// Controls Attributes value types
export type StickyValue = typeof STICKY_CONTROLS[ number ][ 'value' ];
export type CaptionSideValue = typeof CAPTION_SIDE_CONTROLS[ number ][ 'value' ];
export type CellTagValue = typeof CELL_TAG_CONTROLS[ number ][ 'value' ];
export type CellScopeValue = typeof CELL_SCOPE_CONTROLS[ number ][ 'value' ];
export type TextAlignValue = typeof TEXT_ALIGNMENT_CONTROLS[ number ][ 'value' ];
export type VerticalAlignValue = typeof VERTICAL_ALIGNMENT_CONTROLS[ number ][ 'value' ];
export type CornerValue = typeof CORNER_CONTROLS[ number ][ 'value' ];
export type DirectionValue = typeof DIRECTION_CONTROLS[ number ][ 'value' ];
export type SideValue = typeof SIDE_CONTROLS[ number ][ 'value' ];
export type BorderStyleValue = typeof BORDER_STYLE_CONTROLS[ number ][ 'value' ];
export type ContentJustifyValue = typeof CONTENT_JUSTIFY_CONTROLS[ number ][ 'value' ];
export type BorderCollapseValue = typeof BORDER_COLLAPSE_CONTROLS[ number ][ 'value' ];

// Table section name types
export type SectionName = 'head' | 'body' | 'foot';

// Table attributes
export type TableAttributes = Record< SectionName, Row[] >;

// Table row attributes
export interface Row {
	cells: Cell[];
}

// Table cell attributes
export interface Cell {
	content: string;
	styles?: string;
	tag: CellTagValue;
	className?: string;
	id?: string;
	headers?: string;
	scope?: CellScopeValue;
	rowSpan?: string;
	colSpan?: string;
}

// Block attributes
export interface BlockAttributes extends TableAttributes {
	contentJustification: ContentJustifyValue | undefined;
	hasFixedLayout: boolean;
	isScrollOnPc: boolean;
	isScrollOnMobile: boolean;
	isStackedOnMobile: boolean;
	sticky: StickyValue | undefined;
	tableStyles?: string;
	captionStyles?: string;
	captionSide: CaptionSideValue;
	caption: string;
}

// Core Table Block attributes
export interface CoreTableBlockAttributes {
	head: {
		cells: {
			content: string;
			tag: CellTagValue;
		}[];
	};
	body: {
		cells: {
			content: string;
			tag: CellTagValue;
		}[];
	};
	foot: {
		cells: {
			content: string;
			tag: CellTagValue;
		}[];
	};
	hasFixedLayout: boolean;
	caption: string;
}
