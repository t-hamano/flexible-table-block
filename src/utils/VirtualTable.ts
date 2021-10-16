export interface VirtualTable {
	head: Row[];
	body: Row[];
	foot: Row[];
}

export type SectionName = keyof VirtualTable;

export interface Row {
	cells: Cell[];
}

export interface Cell {
	content: string;
	colSpan?: string;
	rowSpan?: string;
	tag: 'td' | 'th';
}
