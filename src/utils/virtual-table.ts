import type { Properties } from 'csstype';
import { times } from 'lodash';

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

interface createTableParams {
	rowCount: number;
	colCount: number;
	headerSection: boolean;
	footerSection: boolean;
}
/**
 * Creates a table state.
 *
 * @param  options
 * @param  options.rowCount      Row count for the table to create.
 * @param  options.colCount      Column count for the table to create.
 * @param  options.headerSection With/without header section.
 * @param  options.footerSection With/without footer section.
 * @return New table state.
 */
export function createTable( {
	rowCount,
	colCount,
	headerSection,
	footerSection,
}: createTableParams ) {
	const createRows = (
		rows: number,
		cols: number,
		tag: 'th' | 'td',
		sectionName: SectionName
	): Section => {
		return times( rows, ( rowIndex: number ) => ( {
			cells: times(
				cols,
				( colIndex: number ): Cell => ( {
					content: '',
					tag,
					vColIndex: colIndex,
					colIndex,
					rowIndex,
					sectionName,
				} )
			),
		} ) );
	};

	return {
		head: createRows( Number( headerSection ), colCount, 'th', 'head' ),
		body: createRows( rowCount, colCount, 'td', 'body' ),
		foot: createRows( Number( footerSection ), colCount, 'td', 'foot' ),
	};
}
