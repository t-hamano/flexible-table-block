/**
 * Internal dependencies
 */
import type {
	STICKY_CONTROLS,
	CAPTION_SIDE_CONTROLS,
	CELL_TAG_CONTROLS,
	TEXT_ALIGNMENT_CONTROLS,
	VERTICAL_ALIGNMENT_CONTROLS,
	CORNER_CONTROLS,
	DIRECTION_CONTROLS,
	SIDE_CONTROLS,
	BORDER_STYLE_CONTROLS,
} from './constants';

// Controls Attributes value types
export type StickyValue = typeof STICKY_CONTROLS[ number ][ 'value' ];
export type CaptionSideValue = typeof CAPTION_SIDE_CONTROLS[ number ][ 'value' ];
export type CellTagValue = typeof CELL_TAG_CONTROLS[ number ][ 'value' ];
export type TextAlignmentValue = typeof TEXT_ALIGNMENT_CONTROLS[ number ][ 'value' ];
export type VerticalAlignmentValue = typeof VERTICAL_ALIGNMENT_CONTROLS[ number ][ 'value' ];
export type CornerValue = typeof CORNER_CONTROLS[ number ][ 'value' ];
export type DirectionValue = typeof DIRECTION_CONTROLS[ number ][ 'value' ];
export type SideValue = typeof SIDE_CONTROLS[ number ][ 'value' ];
export type BorderStyleValue = typeof BORDER_STYLE_CONTROLS[ number ][ 'value' ];
export type ContentJustificationValue = 'left' | 'center' | 'right';

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
	rowSpan?: string;
	colSpan?: string;
}

// Block attributes
export interface BlockAttributes extends TableAttributes {
	contentJustification: ContentJustificationValue | undefined;
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

// Core table block attributes
export interface CoreTableBlockAttributes extends TableAttributes {
	hasFixedLayout: boolean;
	caption: string;
}
