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
	isRectangleSelected,
	mergeCells,
	splitMergedCells,
	toggleSection,
	toTableAttributes,
	toVirtualTable,
	updateCells,
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

// Every section mixes rowspan and colspan cells. Merged cells repeat the same name.
// | head-0   | head-0   | head-0   | head-3   |
// | body-0-0 | body-0-0 | body-0-2 | body-0-3 |
// | body-0-0 | body-0-0 | body-1-2 | body-0-3 |
// | body-2-0 | body-2-0 | body-2-2 | body-0-3 |
// | body-3-0 | body-3-1 | body-3-2 | body-3-2 |
// | foot-0   | foot-1   | foot-1   | foot-1   |
const mixedSpanAttributes: TableAttributes = {
	head: [
		{
			cells: [
				{ content: 'head-0', tag: 'th', colSpan: '3', scope: 'colgroup' },
				{ content: 'head-3', tag: 'th', id: 'head-id' },
			],
		},
	],
	body: [
		{
			cells: [
				{ content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '2', styles: 'color:red;' },
				{ content: 'body-0-2', tag: 'th', scope: 'row' },
				{ content: 'body-0-3', tag: 'td', rowSpan: '3', className: 'is-merged' },
			],
		},
		{ cells: [ { content: 'body-1-2', tag: 'td', headers: 'head-id' } ] },
		{
			cells: [
				{ content: 'body-2-0', tag: 'td', colSpan: '2' },
				{ content: 'body-2-2', tag: 'td' },
			],
		},
		{
			cells: [
				{ content: 'body-3-0', tag: 'td' },
				{ content: 'body-3-1', tag: 'td' },
				{ content: 'body-3-2', tag: 'td', colSpan: '2' },
			],
		},
	],
	foot: [
		{
			cells: [
				{ content: 'foot-0', tag: 'td' },
				{ content: 'foot-1', tag: 'td', colSpan: '3' },
			],
		},
	],
};

describe( 'table-state', () => {
	describe( 'createTable', () => {
		it( 'should create the right virtual table', () => {
			// |   |   |   |
			// |   |   |   |
			// |   |   |   |
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
			// |   |   |   | (head)
			// |   |   |   |
			// |   |   |   |
			// |   |   |   |
			// |   |   |   | (foot)
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
		it( 'should insert a column between columns', () => {
			// Insert a column between the first and second columns.
			const newVTable = insertColumn( createVTable(), { vColIndex: 1 } );
			// | head-0   |          | head-1   | head-2   |
			// | body-0-0 |          | body-0-1 | body-0-2 |
			// | body-1-0 |          | body-1-1 | body-1-2 |
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
							{ content: 'body-0-0', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'body-0-1', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1-0', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'body-1-1', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
						],
					},
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

		it( 'should insert a column after the last column', () => {
			// Insert a column after the last column.
			const newVTable = insertColumn( createVTable(), { vColIndex: 3 } );
			// | head-0   | head-1   | head-2   |          |
			// | body-0-0 | body-0-1 | body-0-2 |          |
			// | body-1-0 | body-1-1 | body-1-2 |          |
			// | body-2-0 | body-2-1 | body-2-2 |          |
			// | foot-0   | foot-1   | foot-2   |          |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head-0', tag: 'th' },
							{ content: 'head-1', tag: 'th' },
							{ content: 'head-2', tag: 'th' },
							{ content: '', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td' },
							{ content: 'body-0-1', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
							{ content: '', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1-0', tag: 'td' },
							{ content: 'body-1-1', tag: 'td' },
							{ content: 'body-1-2', tag: 'td' },
							{ content: '', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
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
							{ content: '', tag: 'td' },
						],
					},
				],
			} );
		} );

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

	describe( 'mergeCells', () => {
		it( 'should merge the selected cells and keep only the first content', () => {
			const vTable = createVTable();
			// Merge the top-left 2x2 body cells without merging their contents.
			const newVTable = mergeCells(
				vTable,
				[
					vTable.body[ 0 ].cells[ 0 ],
					vTable.body[ 0 ].cells[ 1 ],
					vTable.body[ 1 ].cells[ 0 ],
					vTable.body[ 1 ].cells[ 1 ],
				],
				false
			);
			// Merged cells repeat the same name.
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-0 | body-0-2 |
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
							{ content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '2' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [ { content: 'body-1-2', tag: 'td' } ],
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

		it( 'should merge the selected cells and join all contents', () => {
			const vTable = createVTable();
			// Merge the top-left 2x2 body cells and join their contents.
			const newVTable = mergeCells(
				vTable,
				[
					vTable.body[ 0 ].cells[ 0 ],
					vTable.body[ 0 ].cells[ 1 ],
					vTable.body[ 1 ].cells[ 0 ],
					vTable.body[ 1 ].cells[ 1 ],
				],
				true
			);
			// Merged cells repeat the same name, and "merged" joins the contents of the four cells.
			// | head-0   | head-1   | head-2   |
			// | merged   | merged   | body-0-2 |
			// | merged   | merged   | body-1-2 |
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
							{
								content: 'body-0-0<br>body-0-1<br>body-1-0<br>body-1-1',
								tag: 'td',
								rowSpan: '2',
								colSpan: '2',
							},
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [ { content: 'body-1-2', tag: 'td' } ],
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

		it( 'should merge a selection that contains a merged cell', () => {
			const vTable = createMergedVTable();
			// Merge the existing merged cell with the two cells below it.
			const newVTable = mergeCells(
				vTable,
				[ vTable.body[ 0 ].cells[ 0 ], vTable.body[ 2 ].cells[ 0 ], vTable.body[ 2 ].cells[ 1 ] ],
				true
			);
			// Merged cells repeat the same name, and "merged" joins the contents of the three cells.
			// | head-0   | head-1   | head-2   |
			// | merged   | merged   | body-0-2 |
			// | merged   | merged   | body-1-2 |
			// | merged   | merged   | body-2-2 |
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
							{
								content: 'body-0-0<br>body-2-0<br>body-2-1',
								tag: 'td',
								rowSpan: '3',
								colSpan: '2',
							},
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [ { content: 'body-1-2', tag: 'td' } ],
					},
					{
						cells: [ { content: 'body-2-2', tag: 'td' } ],
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

	describe( 'splitMergedCells', () => {
		// Merged cells repeat the same name.
		// | body-0-0 | body-0-0 | body-0-0 |
		// | body-0-0 | body-0-0 | body-0-0 |
		const createFullyMergedVTable = () =>
			toVirtualTable( {
				head: [],
				body: [
					{ cells: [ { content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '3' } ] },
					{ cells: [] },
				],
				foot: [],
			} );

		it( 'should split the merged cell with the correct indexes', () => {
			const vTable = createFullyMergedVTable();
			// Split the merged cell.
			const newVTable = splitMergedCells( vTable, [ vTable.body[ 0 ].cells[ 0 ] ] );
			// | body-0-0 |          |          |
			// |          |          |          |
			expect( newVTable.body ).toMatchObject( [
				{
					cells: [
						{
							content: 'body-0-0',
							rowIndex: 0,
							vColIndex: 0,
							rowSpan: 1,
							colSpan: 1,
							isHidden: false,
						},
						{ content: '', rowIndex: 0, vColIndex: 1, rowSpan: 1, colSpan: 1, isHidden: false },
						{ content: '', rowIndex: 0, vColIndex: 2, rowSpan: 1, colSpan: 1, isHidden: false },
					],
				},
				{
					cells: [
						{ content: '', rowIndex: 1, vColIndex: 0, rowSpan: 1, colSpan: 1, isHidden: false },
						{ content: '', rowIndex: 1, vColIndex: 1, rowSpan: 1, colSpan: 1, isHidden: false },
						{ content: '', rowIndex: 1, vColIndex: 2, rowSpan: 1, colSpan: 1, isHidden: false },
					],
				},
			] );
		} );

		it( 'should restore the original layout after merging cells without merging contents', () => {
			const vTable = createVTable();
			// Merge the top-left 2x2 body cells without merging their contents, then split them again.
			const mergedVTable = mergeCells(
				vTable,
				[
					vTable.body[ 0 ].cells[ 0 ],
					vTable.body[ 0 ].cells[ 1 ],
					vTable.body[ 1 ].cells[ 0 ],
					vTable.body[ 1 ].cells[ 1 ],
				],
				false
			);
			const newVTable = splitMergedCells( mergedVTable, [ mergedVTable.body[ 0 ].cells[ 0 ] ] );
			// | head-0   | head-1   | head-2   |
			// | body-0-0 |          | body-0-2 |
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
							{ content: 'body-0-0', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
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

		it( 'should restore the original layout after merging cells and their contents', () => {
			const vTable = createVTable();
			// Merge the top-left 2x2 body cells and join their contents, then split them again.
			const mergedVTable = mergeCells(
				vTable,
				[
					vTable.body[ 0 ].cells[ 0 ],
					vTable.body[ 0 ].cells[ 1 ],
					vTable.body[ 1 ].cells[ 0 ],
					vTable.body[ 1 ].cells[ 1 ],
				],
				true
			);
			const newVTable = splitMergedCells( mergedVTable, [ mergedVTable.body[ 0 ].cells[ 0 ] ] );
			// "merged" joins the contents of the four cells.
			// | head-0   | head-1   | head-2   |
			// | merged   |          | body-0-2 |
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
							{ content: 'body-0-0<br>body-0-1<br>body-1-0<br>body-1-1', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
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

		it( 'should not mutate the original virtual table', () => {
			const vTable = createFullyMergedVTable();
			const original = structuredClone( vTable );
			// Split the merged cell and check that the input is left untouched.
			splitMergedCells( vTable, [ vTable.body[ 0 ].cells[ 0 ] ] );
			expect( vTable ).toStrictEqual( original );
		} );
	} );

	describe( 'isRectangleSelected', () => {
		it( 'should return false when no cell or only one cell is selected', () => {
			const vTable = createVTable();
			expect( isRectangleSelected( undefined ) ).toBe( false );
			expect( isRectangleSelected( [ vTable.body[ 0 ].cells[ 0 ] ] ) ).toBe( false );
		} );

		it( 'should return true when the selected cells form a rectangle', () => {
			const vTable = createVTable();
			// Select the top-left 2x2 body cells.
			// | body-0-0 | body-0-1 |          |
			// | body-1-0 | body-1-1 |          |
			// |          |          |          |
			const selectedCells = [
				vTable.body[ 0 ].cells[ 0 ],
				vTable.body[ 0 ].cells[ 1 ],
				vTable.body[ 1 ].cells[ 0 ],
				vTable.body[ 1 ].cells[ 1 ],
			];
			expect( isRectangleSelected( selectedCells ) ).toBe( true );
		} );

		it( 'should return false when the selected cells form an L shape', () => {
			const vTable = createVTable();
			// Select three of the top-left 2x2 body cells.
			// | body-0-0 | body-0-1 |          |
			// | body-1-0 |          |          |
			// |          |          |          |
			const selectedCells = [
				vTable.body[ 0 ].cells[ 0 ],
				vTable.body[ 0 ].cells[ 1 ],
				vTable.body[ 1 ].cells[ 0 ],
			];
			expect( isRectangleSelected( selectedCells ) ).toBe( false );
		} );

		it( 'should return false when the selected cells are not adjacent', () => {
			const vTable = createVTable();
			// Select the first and last cells of the first body row.
			// | body-0-0 |          | body-0-2 |
			// |          |          |          |
			// |          |          |          |
			const selectedCells = [ vTable.body[ 0 ].cells[ 0 ], vTable.body[ 0 ].cells[ 2 ] ];
			expect( isRectangleSelected( selectedCells ) ).toBe( false );
		} );

		it( 'should return true when a merged cell and other cells form a rectangle', () => {
			const vTable = createMergedVTable();
			// Select the merged cell and the two cells to its right.
			// Merged cells repeat the same name.
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 | body-1-2 |
			// |          |          |          |
			const selectedCells = [
				vTable.body[ 0 ].cells[ 0 ],
				vTable.body[ 0 ].cells[ 2 ],
				vTable.body[ 1 ].cells[ 2 ],
			];
			expect( isRectangleSelected( selectedCells ) ).toBe( true );
		} );

		it( 'should return false when a merged cell and other cells do not form a rectangle', () => {
			const vTable = createMergedVTable();
			// Select the merged cell and only one of the two cells to its right.
			// Merged cells repeat the same name.
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 |          |
			// |          |          |          |
			const selectedCells = [ vTable.body[ 0 ].cells[ 0 ], vTable.body[ 0 ].cells[ 2 ] ];
			expect( isRectangleSelected( selectedCells ) ).toBe( false );
		} );

		it( 'should return false when the selected cells are in different sections', () => {
			const vTable = createVTable();
			// Select the first header cell and the first body cell.
			// | head-0   |          |          |
			// | body-0-0 |          |          |
			// |          |          |          |
			// |          |          |          |
			const selectedCells = [ vTable.head[ 0 ].cells[ 0 ], vTable.body[ 0 ].cells[ 0 ] ];
			expect( isRectangleSelected( selectedCells ) ).toBe( false );
		} );
	} );

	describe( 'toggleSection', () => {
		it( 'should remove the header when it exists', () => {
			// Remove the header.
			const newVTable = toggleSection( createVTable(), 'head' );
			// | body-0-0 | body-0-1 | body-0-2 |
			// | body-1-0 | body-1-1 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [],
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
		} );

		it( 'should add a header with a th cell for each virtual column', () => {
			// Remove the header first so that it can be added again.
			const vTable = toggleSection( createMergedVTable(), 'head' );
			// Add the header again.
			const newVTable = toggleSection( vTable, 'head' );
			// Merged cells repeat the same name.
			// |          |          |          |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot-0   | foot-1   | foot-2   |
			expect( toTableAttributes( newVTable ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: '', tag: 'th' },
							{ content: '', tag: 'th' },
							{ content: '', tag: 'th' },
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
		} );

		it( 'should add a footer with a td cell for each virtual column', () => {
			// Remove the footer first so that it can be added again.
			const vTable = toggleSection( createMergedVTable(), 'foot' );
			// Add the footer again.
			const newVTable = toggleSection( vTable, 'foot' );
			// Merged cells repeat the same name.
			// | head-0   | head-1   | head-2   |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// |          |          |          |
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
							{ content: 'body-2-0', tag: 'td' },
							{ content: 'body-2-1', tag: 'td' },
							{ content: 'body-2-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
							{ content: '', tag: 'td' },
						],
					},
				],
			} );
		} );
	} );

	describe( 'updateCells', () => {
		// | body-0-0 | body-0-1 |
		const createStyledVTable = () =>
			toVirtualTable( {
				head: [],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td', styles: 'color:red;', className: 'is-red' },
							{ content: 'body-0-1', tag: 'td' },
						],
					},
				],
				foot: [],
			} );

		it( 'should update the tag and attributes of only the selected cells', () => {
			const vTable = createVTable();
			// Change two body cells to header cells with attributes.
			const newVTable = updateCells(
				vTable,
				{ tag: 'th', className: 'is-header', id: 'cell-id', headers: 'head-0', scope: 'row' },
				[ vTable.body[ 0 ].cells[ 0 ], vTable.body[ 1 ].cells[ 1 ] ]
			);
			// Updated cells are marked with *.
			// | head-0    | head-1    | head-2   |
			// | body-0-0* | body-0-1  | body-0-2 |
			// | body-1-0  | body-1-1* | body-1-2 |
			// | body-2-0  | body-2-1  | body-2-2 |
			// | foot-0    | foot-1    | foot-2   |
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
							{
								content: 'body-0-0',
								styles: '',
								tag: 'th',
								className: 'is-header',
								id: 'cell-id',
								headers: 'head-0',
								scope: 'row',
							},
							{ content: 'body-0-1', tag: 'td' },
							{ content: 'body-0-2', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1-0', tag: 'td' },
							{
								content: 'body-1-1',
								styles: '',
								tag: 'th',
								className: 'is-header',
								id: 'cell-id',
								headers: 'head-0',
								scope: 'row',
							},
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

		it( 'should add new styles to the existing styles', () => {
			const vTable = createStyledVTable();
			// Add a background color and padding to the first cell.
			const newVTable = updateCells(
				vTable,
				{
					styles: {
						backgroundColor: '#fff',
						padding: { top: '1px', right: '2px', bottom: '3px', left: '4px' },
					},
				},
				[ vTable.body[ 0 ].cells[ 0 ] ]
			);
			expect( toTableAttributes( newVTable ).body ).toEqual( [
				{
					cells: [
						{
							content: 'body-0-0',
							styles: 'color:red;background-color:#fff;padding:1px 2px 3px 4px;',
							tag: 'td',
							className: 'is-red',
						},
						{ content: 'body-0-1', tag: 'td' },
					],
				},
			] );
		} );

		it( 'should shorten border styles that are the same on all sides', () => {
			const vTable = createStyledVTable();
			// Add the same border width, style and color on all sides of the first cell.
			const newVTable = updateCells(
				vTable,
				{
					styles: {
						borderWidth: { top: '1px', right: '1px', bottom: '1px', left: '1px' },
						borderStyle: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
						borderColor: { top: '#000', right: '#000', bottom: '#000', left: '#000' },
					},
				},
				[ vTable.body[ 0 ].cells[ 0 ] ]
			);
			expect( toTableAttributes( newVTable ).body ).toEqual( [
				{
					cells: [
						{
							content: 'body-0-0',
							styles: 'color:red;border-width:1px;border-style:solid;border-color:#000;',
							tag: 'td',
							className: 'is-red',
						},
						{ content: 'body-0-1', tag: 'td' },
					],
				},
			] );
		} );

		it( 'should remove an attribute when it is updated with undefined', () => {
			const vTable = createStyledVTable();
			// Remove the class name from the first cell.
			const newVTable = updateCells( vTable, { className: undefined }, [
				vTable.body[ 0 ].cells[ 0 ],
			] );
			expect( toTableAttributes( newVTable ).body ).toEqual( [
				{
					cells: [
						{ content: 'body-0-0', styles: 'color:red;', tag: 'td' },
						{ content: 'body-0-1', tag: 'td' },
					],
				},
			] );
		} );
	} );

	describe( 'toVirtualTable', () => {
		it( 'should clamp rowspan that overflows the section', () => {
			// Convert a table whose rowspan is larger than the number of rows.
			const vTable = toVirtualTable( {
				head: [],
				body: [ { cells: [ { content: 'body-0-0', tag: 'td', rowSpan: '2' } ] } ],
				foot: [],
			} );
			// | body-0-0 |
			expect( vTable.body ).toMatchObject( [
				{ cells: [ { content: 'body-0-0', rowSpan: 1, colSpan: 1, isHidden: false } ] },
			] );
		} );

		it( 'should clamp colspan that overflows the section', () => {
			// Convert a table whose colspan is larger than the number of columns.
			const vTable = toVirtualTable( {
				head: [],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td' },
							{ content: 'body-0-1', tag: 'td' },
						],
					},
					{ cells: [ { content: 'body-1-0', tag: 'td', colSpan: '3' } ] },
				],
				foot: [],
			} );
			// Merged cells repeat the same name, and the repeated ones are hidden cells.
			// | body-0-0 | body-0-1 |
			// | body-1-0 | body-1-0 |
			expect( vTable.body ).toMatchObject( [
				{
					cells: [
						{ content: 'body-0-0', rowSpan: 1, colSpan: 1, isHidden: false },
						{ content: 'body-0-1', rowSpan: 1, colSpan: 1, isHidden: false },
					],
				},
				{
					cells: [
						{ content: 'body-1-0', rowSpan: 1, colSpan: 2, isHidden: false },
						{ isHidden: true },
					],
				},
			] );
		} );

		it( 'should clamp rowspan and colspan that both overflow the section', () => {
			// Convert a table whose rowspan and colspan are both larger than the section.
			const vTable = toVirtualTable( {
				head: [],
				body: [
					{
						cells: [
							{ content: 'body-0-0', tag: 'td' },
							{ content: 'body-0-1', tag: 'td', rowSpan: '3', colSpan: '2' },
						],
					},
					{ cells: [ { content: 'body-1-0', tag: 'td' } ] },
				],
				foot: [],
			} );
			// Merged cells repeat the same name, and the repeated ones are hidden cells.
			// | body-0-0 | body-0-1 | body-0-1 |
			// | body-1-0 | body-0-1 | body-0-1 |
			expect( vTable.body ).toMatchObject( [
				{
					cells: [
						{ content: 'body-0-0', rowSpan: 1, colSpan: 1, isHidden: false },
						{ content: 'body-0-1', rowSpan: 2, colSpan: 2, isHidden: false },
						{ isHidden: true },
					],
				},
				{
					cells: [
						{ content: 'body-1-0', rowSpan: 1, colSpan: 1, isHidden: false },
						{ isHidden: true },
						{ isHidden: true },
					],
				},
			] );
		} );

		it( 'should place cells and hidden cells at the right virtual positions', () => {
			// Convert the block attributes into a virtual table.
			const vTable = toVirtualTable( mixedSpanAttributes );
			// Merged cells repeat the same name, and the repeated ones are hidden cells.
			// | head-0   | head-0   | head-0   | head-3   |
			// | body-0-0 | body-0-0 | body-0-2 | body-0-3 |
			// | body-0-0 | body-0-0 | body-1-2 | body-0-3 |
			// | body-2-0 | body-2-0 | body-2-2 | body-0-3 |
			// | body-3-0 | body-3-1 | body-3-2 | body-3-2 |
			// | foot-0   | foot-1   | foot-1   | foot-1   |
			expect( vTable ).toMatchObject( {
				head: [
					{
						cells: [
							{ content: 'head-0', rowSpan: 1, colSpan: 3, isHidden: false },
							{ isHidden: true },
							{ isHidden: true },
							{ content: 'head-3', rowSpan: 1, colSpan: 1, isHidden: false },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0-0', rowSpan: 2, colSpan: 2, isHidden: false },
							{ isHidden: true },
							{ content: 'body-0-2', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'body-0-3', rowSpan: 3, colSpan: 1, isHidden: false },
						],
					},
					{
						cells: [
							{ isHidden: true },
							{ isHidden: true },
							{
								content: 'body-1-2',
								rowSpan: 1,
								colSpan: 1,
								isHidden: false,
								rowIndex: 1,
								vColIndex: 2,
							},
							{ isHidden: true },
						],
					},
					{
						cells: [
							{ content: 'body-2-0', rowSpan: 1, colSpan: 2, isHidden: false },
							{ isHidden: true },
							{ content: 'body-2-2', rowSpan: 1, colSpan: 1, isHidden: false },
							{ isHidden: true },
						],
					},
					{
						cells: [
							{ content: 'body-3-0', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'body-3-1', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'body-3-2', rowSpan: 1, colSpan: 2, isHidden: false },
							{ isHidden: true },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot-0', rowSpan: 1, colSpan: 1, isHidden: false },
							{ content: 'foot-1', rowSpan: 1, colSpan: 3, isHidden: false },
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
			// Convert to a virtual table and back, twice.
			const once = toTableAttributes( toVirtualTable( mixedSpanAttributes ) );
			const twice = toTableAttributes( toVirtualTable( once ) );
			expect( once ).toEqual( mixedSpanAttributes );
			expect( twice ).toStrictEqual( once );
		} );
	} );
} );
