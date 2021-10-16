import type { Properties } from 'csstype';

export interface VirtualTable {
	head: Row[];
	body: Row[];
	foot: Row[];
}

export type SectionName = keyof VirtualTable;

export interface Row {
	cells: Cell[];
}

export type Section = Row[];

export interface Cell {
	content: string;
	colSpan?: string; //TODO It should be a numeric type.
	rowSpan?: string; //TODO It should be a numeric type.
	styles?: Properties;
	sectionName: string;
	vColIndex: number;
	colIndex: number;
	rowIndex: number;
	tag: 'td' | 'th';
}
