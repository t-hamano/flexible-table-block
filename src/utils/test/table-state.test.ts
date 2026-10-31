/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import {
	createTable,
	deleteColumn,
	deleteRow,
	insertColumn,
	insertRow,
	splitMergedCells,
	toTableAttributes,
	toVirtualTable,
	type VTable,
	type VRow,
	type VCell,
} from '../table-state';
import type { SectionName, TableAttributes } from '../../BlockAttributes';

const getRow = (
	cells: number,
	sectionName: SectionName,
	rowIndex: number,
	tag: 'th' | 'td',
	content = '',
	options = {}
): VRow => {
	return {
		cells: Array.from( { length: cells } ).map( ( _, vColIndex ): VCell => {
			return {
				content,
				tag,
				rowIndex,
				vColIndex,
				sectionName,
				rowSpan: 1,
				colSpan: 1,
				isHidden: false,
				isFirstSelected: false,
				...options,
			};
		} ),
	};
};

// | head-0   | head-1   | head-2   |
// | body-0-0 | body-0-1 | body-0-2 |
// | body-1-0 | body-1-1 | body-1-2 |
// | body-2-0 | body-2-1 | body-2-2 |
// | foot-0   | foot-1   | foot-2   |
const createVTable = () =>
	toVirtualTable( {
		head: [
			{
				cells: [
					{ content: 'head-0', tag: 'th' },
					{ content: 'head-1', tag: 'th' },
					{ content: 'head-2', tag: 'th' },
				],
			},
		],
		body: [
			{
				cells: [
					{ content: 'body-0-0', tag: 'td' },
					{ content: 'body-0-1', tag: 'td' },
					{ content: 'body-0-2', tag: 'td' },
				],
			},
			{
				cells: [
					{ content: 'body-1-0', tag: 'td' },
					{ content: 'body-1-1', tag: 'td' },
					{ content: 'body-1-2', tag: 'td' },
				],
			},
			{
				cells: [
					{ content: 'body-2-0', tag: 'td' },
					{ content: 'body-2-1', tag: 'td' },
					{ content: 'body-2-2', tag: 'td' },
				],
			},
		],
		foot: [
			{
				cells: [
					{ content: 'foot-0', tag: 'td' },
					{ content: 'foot-1', tag: 'td' },
					{ content: 'foot-2', tag: 'td' },
				],
			},
		],
	} );

// Merged cells repeat the same name.
// | head-0   | head-1   | head-2   |
// | body-0-0 | body-0-0 | body-0-2 |
// | body-0-0 | body-0-0 | body-1-2 |
// | body-2-0 | body-2-1 | body-2-2 |
// | foot-0   | foot-1   | foot-2   |
const createMergedVTable = () =>
	toVirtualTable( {
		head: [
			{
				cells: [
					{ content: 'head-0', tag: 'th' },
					{ content: 'head-1', tag: 'th' },
					{ content: 'head-2', tag: 'th' },
				],
			},
		],
		body: [
			{
				cells: [
					{ content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '2' },
					{ content: 'body-0-2', tag: 'td' },
				],
			},
			{ cells: [ { content: 'body-1-2', tag: 'td' } ] },
			{
				cells: [
					{ content: 'body-2-0', tag: 'td' },
					{ content: 'body-2-1', tag: 'td' },
					{ content: 'body-2-2', tag: 'td' },
				],
			},
		],
		foot: [
			{
				cells: [
					{ content: 'foot-0', tag: 'td' },
					{ content: 'foot-1', tag: 'td' },
					{ content: 'foot-2', tag: 'td' },
				],
			},
		],
	} );

// Every section mixes rowspan and colspan cells.
// body (4x4), merged cells repeat the same letter:
// | A | A | B | C |
// | A | A | D | C |
// | E | E | F | C |
// | G | H | I | I |
const mixedSpanAttributes: TableAttributes = {
	head: [
		{
			cells: [
				{ content: 'h-0', tag: 'th', colSpan: '3', scope: 'colgroup' },
				{ content: 'h-1', tag: 'th', id: 'head-id' },
			],
		},
	],
	body: [
		{
			cells: [
				{ content: 'A', tag: 'td', rowSpan: '2', colSpan: '2', styles: 'color:red;' },
				{ content: 'B', tag: 'th', scope: 'row' },
				{ content: 'C', tag: 'td', rowSpan: '3', className: 'is-c' },
			],
		},
		{ cells: [ { content: 'D', tag: 'td', headers: 'head-id' } ] },
		{
			cells: [
				{ content: 'E', tag: 'td', colSpan: '2' },
				{ content: 'F', tag: 'td' },
			],
		},
		{
			cells: [
				{ content: 'G', tag: 'td' },
				{ content: 'H', tag: 'td' },
				{ content: 'I', tag: 'td', colSpan: '2' },
			],
		},
	],
	foot: [
		{
			cells: [
				{ content: 'f-0', tag: 'td' },
				{ content: 'f-1', tag: 'td', colSpan: '3' },
			],
		},
	],
};

describe( 'table-state', () => {
	describe( 'createTable', () => {
		it( 'should create the right virtual table', () => {
			expect(
				createTable( { rowCount: 3, colCount: 3, headerSection: false, footerSection: false } )
			).toStrictEqual( {
				head: [],
				body: [
					getRow( 3, 'body', 0, 'td' ),
					getRow( 3, 'body', 1, 'td' ),
					getRow( 3, 'body', 2, 'td' ),
				],
				foot: [],
			} );
		} );

		it( 'should create virtual table with head and foot', () => {
			expect(
				createTable( { rowCount: 3, colCount: 3, headerSection: true, footerSection: true } )
			).toStrictEqual( {
				head: [ getRow( 3, 'head', 0, 'th' ) ],
				body: [
					getRow( 3, 'body', 0, 'td' ),
					getRow( 3, 'body', 1, 'td' ),
					getRow( 3, 'body', 2, 'td' ),
				],
				foot: [ getRow( 3, 'foot', 0, 'td' ) ],
			} );
		} );
	} );

	describe( 'insertRow', () => {
		it( 'should insert a row between rows', () => {
			// Insert a row between the first and second body rows.
			const newVTable = insertRow( createVTable(), { sectionName: 'body', rowIndex: 1 } );
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-1 | body-0-2 |
			// |          |          |          |
			// | body-1-0 | body-1-1 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td' },
							{ content: 'body-0-1', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1-0', tag: 'td' },
							{ content: 'body-1-1', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should insert a row after the last row', () => {
			// Insert a row after the last body row.
			const newVTable = insertRow( createVTable(), { sectionName: 'body', rowIndex: 3 } );
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-1 | body-0-2 |
			// | body-1-0 | body-1-1 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// |          |          |          |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td' },
							{ content: 'body-0-1', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1-0', tag: 'td' },
							{ content: 'body-1-1', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should expand the rowspan when inserting a row inside a merged cell', () => {
			// Insert a row between the first and second body rows, inside the merged cell.
			const newVTable = insertRow( createMergedVTable(), { sectionName: 'body', rowIndex: 1 } );
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 |          |
			// | body-0-0 | body-0-0 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td', rowSpan: '3', colSpan: '2' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{ cells: [ { content: '', tag: 'td' } ] },
					{ cells: [ { content: 'body-1-2', tag: 'td' } ] },
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should not expand the rowspan when inserting a row right after a merged cell', () => {
			// Insert a row right after the merged cell.
			const newVTable = insertRow( createMergedVTable(), { sectionName: 'body', rowIndex: 2 } );
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 | body-1-2 |
			// |          |          |          |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '2' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{ cells: [ { content: 'body-1-2', tag: 'td' } ] },
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );
	} );

	describe( 'deleteRow', () => {
		it( 'should delete the first row', () => {
			// Delete the first body row.
			const newVTable = deleteRow( createVTable(), { sectionName: 'body', rowIndex: 0 } );
			// | head-0   | head-1   | head-2   |
			// | body-1-0 | body-1-1 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-1-0', tag: 'td' },
							{ content: 'body-1-1', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should delete a row in the middle', () => {
			// Delete the second body row.
			const newVTable = deleteRow( createVTable(), { sectionName: 'body', rowIndex: 1 } );
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-1 | body-0-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td' },
							{ content: 'body-0-1', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should split the merged cell when deleting the row where it starts', () => {
			// Delete the first body row, where the merged cell starts.
			const newVTable = deleteRow( createMergedVTable(), { sectionName: 'body', rowIndex: 0 } );
			// | head-0   | head-1   | head-2   |
			// |          |          | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should contract the rowspan when deleting a row inside a merged cell', () => {
			// Delete the second body row, which the merged cell spans.
			const newVTable = deleteRow( createMergedVTable(), { sectionName: 'body', rowIndex: 1 } );
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td', colSpan: '2' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );
	} );

	describe( 'deleteColumn', () => {
		it( 'should delete the first column', () => {
			// Delete the first column.
			const newVTable = deleteColumn( createVTable(), { vColIndex: 0 } );
			// | head-1   | head-2   |
			// | body-0-1 | body-0-2 |
			// | body-1-1 | body-1-2 |
			// | body-2-1 | body-2-2 |
			// | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-1', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1-1', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should delete the last column', () => {
			// Delete the last column.
			const newVTable = deleteColumn( createVTable(), { vColIndex: 2 } );
			// | head-0   | head-1   |
			// | body-0-0 | body-0-1 |
			// | body-1-0 | body-1-1 |
			// | body-2-0 | body-2-1 |
			// | foot-0   | foot-1   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td' },
							{ content: 'body-0-1', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1-0', tag: 'td' },
							{ content: 'body-1-1', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should split the merged cell when deleting the column where it starts', () => {
			// Delete the first column, where the merged cell starts.
			const newVTable = deleteColumn( createMergedVTable(), { vColIndex: 0 } );
			// | head-1   | head-2   |
			// |          | body-0-2 |
			// |          | body-1-2 |
			// | body-2-1 | body-2-2 |
			// | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should contract the colspan when deleting a column inside a merged cell', () => {
			// Delete the second column, which the merged cell spans.
			const newVTable = deleteColumn( createMergedVTable(), { vColIndex: 1 } );
			// | head-0   | head-2   |
			// | body-0-0 | body-0-2 |
			// | body-0-0 | body-1-2 |
			// | body-2-0 | body-2-2 |
			// | foot-0   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td', rowSpan: '2' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{ cells: [ { content: 'body-1-2', tag: 'td' } ] },
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );
	} );

	describe( 'insertColumn', () => {
		it( 'should give the correct virtual column index to the cell inserted after the last column', () => {
			const vTable = toVirtualTable( {
				head: [],
				body: [ { cells: [ { content: 'body-0-0', tag: 'td' } ] } ],
				foot: [],
			} );
			// Insert a column after the last column.
			const newVTable = insertColumn( vTable, { vColIndex: 1 } );
			// | body-0-0 |          |
			expect( newVTable.body[ 0 ].cells.map( ( cell ) => cell.vColIndex ) ).toStrictEqual( [
				0, 1,
			] );
		} );

		it( 'should expand the colspan when inserting a column inside a merged cell', () => {
			// Insert a column between the first and second columns, inside the merged cell.
			const newVTable = insertColumn( createMergedVTable(), { vColIndex: 1 } );
			// | head-0   |          | head-1   | head-2   |
			// | body-0-0 | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 | body-0-0 | body-1-2 |
			// | body-2-0 |          | body-2-1 | body-2-2 |
			// | foot-0   |          | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: '', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '3' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{ cells: [ { content: 'body-1-2', tag: 'td' } ] },
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should not expand the colspan when inserting a column right after a merged cell', () => {
			// Insert a column right after the merged cell.
			const newVTable = insertColumn( createMergedVTable(), { vColIndex: 2 } );
			// | head-0   | head-1   |          | head-2   |
			// | body-0-0 | body-0-0 |          | body-0-2 |
			// | body-0-0 | body-0-0 |          | body-1-2 |
			// | body-2-0 | body-2-1 |          | body-2-2 |
			// | foot-0   | foot-1   |          | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: '', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '2' },
							{ content: '', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', tag: 'td' },
							{ content: 'foot-1', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'foot-2', tag: 'td' },
						],
					},
				],
			} );
		} );
	} );

	describe( 'splitMergedCells', () => {
		// | merged | merged | merged |
		// | merged | merged | merged |
		const createSplitTargetVTable = () =>
			toVirtualTable( {
				head: [],
				body: [
					{
						cells: [ { content: 'merged', tag: 'td', rowSpan: '2', colSpan: '3' } ],
					},
					{ cells: [] },
				],
				foot: [],
			} );

		it( 'should split the merged cell with the correct indexes', () => {
			const vTable = createSplitTargetVTable();
			const newVTable = splitMergedCells( vTable, [ vTable.body[ 0 ].cells[ 0 ] ] );
			newVTable.body.forEach( ( row, rowIndex ) => {
				row.cells.forEach( ( cell, vColIndex ) => {
					expect( cell ).toMatchObject( {
						rowIndex,
						vColIndex,
						rowSpan: 1,
						colSpan: 1,
						isHidden: false,
					} );
				} );
			} );
		} );

		it( 'should not mutate the original virtual table', () => {
			const vTable = createSplitTargetVTable();
			const original = structuredClone( vTable );
			splitMergedCells( vTable, [ vTable.body[ 0 ].cells[ 0 ] ] );
			expect( vTable ).toStrictEqual( original );
		} );
	} );

	describe( 'toVirtualTable', () => {
		const getSpans = ( vTable: VTable ) =>
			vTable.body.map( ( row ) =>
				row.cells.map( ( { rowSpan, colSpan, isHidden } ) => ( { rowSpan, colSpan, isHidden } ) )
			);

		it( 'should clamp rowspan that overflows the section', () => {
			const vTable = toVirtualTable( {
				head: [],
				body: [ { cells: [ { content: '', tag: 'td', rowSpan: '2' } ] } ],
				foot: [],
			} );
			expect( getSpans( vTable ) ).toStrictEqual( [
				[ { rowSpan: 1, colSpan: 1, isHidden: false } ],
			] );
		} );

		it( 'should clamp colspan that overflows the section', () => {
			const vTable = toVirtualTable( {
				head: [],
				body: [
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
						],
					},
					{ cells: [ { content: '', tag: 'td', colSpan: '3' } ] },
				],
				foot: [],
			} );
			expect( getSpans( vTable ) ).toStrictEqual( [
				[
					{ rowSpan: 1, colSpan: 1, isHidden: false },
					{ rowSpan: 1, colSpan: 1, isHidden: false },
				],
				[
					{ rowSpan: 1, colSpan: 2, isHidden: false },
					{ rowSpan: 1, colSpan: 1, isHidden: true },
				],
			] );
		} );

		it( 'should clamp rowspan and colspan that both overflow the section', () => {
			const vTable = toVirtualTable( {
				head: [],
				body: [
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td', rowSpan: '3', colSpan: '2' },
						],
					},
					{ cells: [ { content: '', tag: 'td' } ] },
				],
				foot: [],
			} );
			expect( getSpans( vTable ) ).toStrictEqual( [
				[
					{ rowSpan: 1, colSpan: 1, isHidden: false },
					{ rowSpan: 2, colSpan: 2, isHidden: false },
					{ rowSpan: 1, colSpan: 1, isHidden: true },
				],
				[
					{ rowSpan: 1, colSpan: 1, isHidden: false },
					{ rowSpan: 1, colSpan: 1, isHidden: true },
					{ rowSpan: 1, colSpan: 1, isHidden: true },
				],
			] );
		} );

		it( 'should place cells and hidden cells at the right virtual positions', () => {
			const vTable = toVirtualTable( mixedSpanAttributes );
			// Hidden cells are the virtual cells covered by a merged cell.
			expect( vTable ).toMatchObject( {
				head: [
					{
						cells: [
							{ content: 'h-0', rowSpan: 1, colSpan: 3, isHidden: false },
							{ isHidden: true },
							{ isHidden: true },
							{ content: 'h-1', rowSpan: 1, colSpan: 1, isHidden: false },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'A', rowSpan: 2, colSpan: 2, isHidden: false },
							{ isHidden: true },
							{ content: 'B', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'C', rowSpan: 3, colSpan: 1, isHidden: false },
						],
					},
					{
						cells: [
							{ isHidden: true },
							{ isHidden: true },
							{ content: 'D', rowSpan: 1, colSpan: 1, isHidden: false, rowIndex: 1, vColIndex: 2 },
							{ isHidden: true },
						],
					},
					{
						cells: [
							{ content: 'E', rowSpan: 1, colSpan: 2, isHidden: false },
							{ isHidden: true },
							{ content: 'F', rowSpan: 1, colSpan: 1, isHidden: false },
							{ isHidden: true },
						],
					},
					{
						cells: [
							{ content: 'G', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'H', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'I', rowSpan: 1, colSpan: 2, isHidden: false },
							{ isHidden: true },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'f-0', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'f-1', rowSpan: 1, colSpan: 3, isHidden: false },
							{ isHidden: true },
							{ isHidden: true },
						],
					},
				],
			} );
		} );
	} );

	describe( 'toVirtualTable / toTableAttributes round-trip', () => {
		it( 'should restore the original table attributes and be stable when converted repeatedly', () => {
			const once = toTableAttributes( toVirtualTable( mixedSpanAttributes ) );
			const twice = toTableAttributes( toVirtualTable( once ) );
			expect( once ).toEqual( mixedSpanAttributes );
			expect( twice ).toStrictEqual( once );
		} );
	} );
} );
