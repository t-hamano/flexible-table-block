// Section name types
export type SectionName = 'head' | 'body' | 'foot';

// Table attributes
export type TableAttributes = Record< SectionName, Row[] >;

export interface Row {
	cells: Cell[];
}

// Table cell attributes
export interface Cell {
	content: string;
	styles?: string;
	tag: 'td' | 'th';
	className?: string;
	rowSpan?: string;
	colSpan?: string;
}

export interface BlockAttributes extends TableAttributes {
	contentJustification: 'left' | 'center' | 'right' | undefined;
	hasFixedLayout: boolean;
	isScrollOnPc: boolean;
	isScrollOnMobile: boolean;
	isStackedOnMobile: boolean;
	sticky: string;
	tableStyles?: string;
	captionStyles?: string;
	captionSide: string;
	caption: string;
}

export interface CoreTableBlockAttributes extends TableAttributes {
	hasFixedLayout: string;
	caption: string;
}
