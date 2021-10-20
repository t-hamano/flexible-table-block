// Section name types
export type SectionName = 'head' | 'body' | 'foot';

// Table attributes
export type TableAttributes = Record< SectionName, { cells: Cell[] }[] >;

// Table cell attributes
export interface Cell {
	content: string;
	styles?: string;
	tag: 'td' | 'th';
	className?: string;
	rowSpan?: string;
	colSpan?: string;
}

export default interface BlockAttributes extends TableAttributes {
	contentJustification: 'left' | 'center' | 'right' | undefined;
	hasFixedLayout: boolean;
	isScrollOnPc: boolean;
	isStackedOnMobile: boolean;
	sticky: string;
	tableStyles: string;
	captionStyles: string;
	captionSide: string;
	caption: string;
}
