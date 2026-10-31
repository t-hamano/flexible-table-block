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

const deepFreeze = < T >( object: T ): T => {
	Object.values( object as object ).forEach( ( value ) => {
		if ( value && typeof value === 'object' ) {
			deepFreeze( value );
		}
	} );
	return Object.freeze( object );
};

// | head   | head   | head   |
// | body-0 | body-0 | body-0 |
// | body-1 | body-1 | body-1 |
// | body-2 | body-2 | body-2 |
// | foot   | foot   | foot   |
const createVTable = () =>
	toVirtualTable( {
		head: [
			{
				cells: [
					{ content: 'head', tag: 'th' },
					{ content: 'head', tag: 'th' },
					{ content: 'head', tag: 'th' },
				],
			},
		],
		body: [
			{
				cells: [
					{ content: 'body-0', tag: 'td' },
					{ content: 'body-0', tag: 'td' },
					{ content: 'body-0', tag: 'td' },
				],
			},
			{
				cells: [
					{ content: 'body-1', tag: 'td' },
					{ content: 'body-1', tag: 'td' },
					{ content: 'body-1', tag: 'td' },
				],
			},
			{
				cells: [
					{ content: 'body-2', tag: 'td' },
					{ content: 'body-2', tag: 'td' },
					{ content: 'body-2', tag: 'td' },
				],
			},
		],
		foot: [
			{
				cells: [
					{ content: 'foot', tag: 'td' },
					{ content: 'foot', tag: 'td' },
					{ content: 'foot', tag: 'td' },
				],
			},
		],
	} );

// Merged cells repeat the same name.
// | head     | head     | head     |
// | body-0-0 | body-0-0 | body-0-2 |
// | body-0-0 | body-0-0 | body-1-2 |
// | body-2-0 | body-2-1 | body-2-2 |
// | foot     | foot     | foot     |
const createMergedVTable = () =>
	toVirtualTable( {
		head: [
			{
				cells: [
					{ content: 'head', tag: 'th' },
					{ content: 'head', tag: 'th' },
					{ content: 'head', tag: 'th' },
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
					{ content: 'foot', tag: 'td' },
					{ content: 'foot', tag: 'td' },
					{ content: 'foot', tag: 'td' },
				],
			},
		],
	} );

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
		it( 'should return the table with the correct number of rows', () => {
			// | head   | head   | head   |
			// | body-0 | body-0 | body-0 |
			// |        |        |        |
			// | body-1 | body-1 | body-1 |
			// | body-2 | body-2 | body-2 |
			// | foot   | foot   | foot   |
			expect(
				toTableAttributes( insertRow( createVTable(), { sectionName: 'body', rowIndex: 1 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
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
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
			// | head   | head   | head   |
			// | body-0 | body-0 | body-0 |
			// | body-1 | body-1 | body-1 |
			// | body-2 | body-2 | body-2 |
			// |        |        |        |
			// | foot   | foot   | foot   |
			expect(
				toTableAttributes( insertRow( createVTable(), { sectionName: 'body', rowIndex: 3 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
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
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should expand the rowspan when inserting a row inside a merged cell', () => {
			// | head     | head     | head     |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 |          |
			// | body-0-0 | body-0-0 | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot     | foot     | foot     |
			expect(
				toTableAttributes( insertRow( createMergedVTable(), { sectionName: 'body', rowIndex: 1 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
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
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should not expand the rowspan when inserting a row right after a merged cell', () => {
			// | head     | head     | head     |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 | body-1-2 |
			// |          |          |          |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot     | foot     | foot     |
			expect(
				toTableAttributes( insertRow( createMergedVTable(), { sectionName: 'body', rowIndex: 2 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
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
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
		} );
	} );

	describe( 'deleteRow', () => {
		it( 'should return the table with the correct number of rows', () => {
			// | head   | head   | head   |
			// | body-1 | body-1 | body-1 |
			// | body-2 | body-2 | body-2 |
			// | foot   | foot   | foot   |
			expect(
				toTableAttributes( deleteRow( createVTable(), { sectionName: 'body', rowIndex: 0 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
			// | head   | head   | head   |
			// | body-0 | body-0 | body-0 |
			// | body-2 | body-2 | body-2 |
			// | foot   | foot   | foot   |
			expect(
				toTableAttributes( deleteRow( createVTable(), { sectionName: 'body', rowIndex: 1 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should split the merged cell when deleting the row where it starts', () => {
			// | head     | head     | head     |
			// |          |          | body-1-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot     | foot     | foot     |
			expect(
				toTableAttributes( deleteRow( createMergedVTable(), { sectionName: 'body', rowIndex: 0 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
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
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should contract the rowspan when deleting a row inside a merged cell', () => {
			// | head     | head     | head     |
			// | body-0-0 | body-0-0 | body-0-2 |
			// | body-2-0 | body-2-1 | body-2-2 |
			// | foot     | foot     | foot     |
			expect(
				toTableAttributes( deleteRow( createMergedVTable(), { sectionName: 'body', rowIndex: 1 } ) )
			).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
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
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
		} );
	} );

	describe( 'deleteColumn', () => {
		it( 'should return the table with the correct number of columns', () => {
			// | head   | head   |
			// | body-0 | body-0 |
			// | body-1 | body-1 |
			// | body-2 | body-2 |
			// | foot   | foot   |
			expect( toTableAttributes( deleteColumn( createVTable(), { vColIndex: 0 } ) ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
			// | head   | head   |
			// | body-0 | body-0 |
			// | body-1 | body-1 |
			// | body-2 | body-2 |
			// | foot   | foot   |
			expect( toTableAttributes( deleteColumn( createVTable(), { vColIndex: 2 } ) ) ).toEqual( {
				head: [
					{
						cells: [
							{ content: 'head', tag: 'th' },
							{ content: 'head', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'body-0', tag: 'td' },
							{ content: 'body-0', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-1', tag: 'td' },
							{ content: 'body-1', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'body-2', tag: 'td' },
							{ content: 'body-2', tag: 'td' },
						],
					},
				],
				foot: [
					{
						cells: [
							{ content: 'foot', tag: 'td' },
							{ content: 'foot', tag: 'td' },
						],
					},
				],
			} );
		} );

		it( 'should split the merged cell when deleting the column where it starts', () => {
			// | head     | head     |
			// |          | body-0-2 |
			// |          | body-1-2 |
			// | body-2-1 | body-2-2 |
			// | foot     | foot     |
			expect( toTableAttributes( deleteColumn( createMergedVTable(), { vColIndex: 0 } ) ) ).toEqual(
				{
					head: [
						{
							cells: [
								{ content: 'head', tag: 'th' },
								{ content: 'head', tag: 'th' },
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
								{ content: 'foot', tag: 'td' },
								{ content: 'foot', tag: 'td' },
							],
						},
					],
				}
			);
		} );

		it( 'should contract the colspan when deleting a column inside a merged cell', () => {
			// | head     | head     |
			// | body-0-0 | body-0-2 |
			// | body-0-0 | body-1-2 |
			// | body-2-0 | body-2-2 |
			// | foot     | foot     |
			expect( toTableAttributes( deleteColumn( createMergedVTable(), { vColIndex: 1 } ) ) ).toEqual(
				{
					head: [
						{
							cells: [
								{ content: 'head', tag: 'th' },
								{ content: 'head', tag: 'th' },
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
								{ content: 'foot', tag: 'td' },
								{ content: 'foot', tag: 'td' },
							],
						},
					],
				}
			);
		} );
	} );

	describe( 'insertColumn', () => {
		it( 'should give the correct virtual column index to the cell inserted after the last column', () => {
			const vTable = deepFreeze(
				toVirtualTable( {
					head: [],
					body: [ { cells: [ { content: 'body-0', tag: 'td' } ] } ],
					foot: [],
				} )
			);
			const newVTable = insertColumn( vTable, { vColIndex: 1 } );
			// | body-0 |        |
			expect( newVTable.body[ 0 ].cells.map( ( cell ) => cell.vColIndex ) ).toStrictEqual( [
				0, 1,
			] );
		} );

		it( 'should expand the colspan when inserting a column inside a merged cell', () => {
			// | head     |          | head     | head     |
			// | body-0-0 | body-0-0 | body-0-0 | body-0-2 |
			// | body-0-0 | body-0-0 | body-0-0 | body-1-2 |
			// | body-2-0 |          | body-2-1 | body-2-2 |
			// | foot     |          | foot     | foot     |
			expect( toTableAttributes( insertColumn( createMergedVTable(), { vColIndex: 1 } ) ) ).toEqual(
				{
					head: [
						{
							cells: [
								{ content: 'head', tag: 'th' },
								{ content: '', tag: 'th' },
								{ content: 'head', tag: 'th' },
								{ content: 'head', tag: 'th' },
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
								{ content: 'foot', tag: 'td' },
								{ content: '', tag: 'td' },
								{ content: 'foot', tag: 'td' },
								{ content: 'foot', tag: 'td' },
							],
						},
					],
				}
			);
		} );

		it( 'should not expand the colspan when inserting a column right after a merged cell', () => {
			// | head     | head     |          | head     |
			// | body-0-0 | body-0-0 |          | body-0-2 |
			// | body-0-0 | body-0-0 |          | body-1-2 |
			// | body-2-0 | body-2-1 |          | body-2-2 |
			// | foot     | foot     |          | foot     |
			expect( toTableAttributes( insertColumn( createMergedVTable(), { vColIndex: 2 } ) ) ).toEqual(
				{
					head: [
						{
							cells: [
								{ content: 'head', tag: 'th' },
								{ content: 'head', tag: 'th' },
								{ content: '', tag: 'th' },
								{ content: 'head', tag: 'th' },
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
								{ content: 'foot', tag: 'td' },
								{ content: 'foot', tag: 'td' },
								{ content: '', tag: 'td' },
								{ content: 'foot', tag: 'td' },
							],
						},
					],
				}
			);
		} );
	} );

	describe( 'splitMergedCells', () => {
		const vTable = deepFreeze(
			toVirtualTable( {
				head: [],
				body: [
					{
						cells: [ { content: 'merged', tag: 'td', rowSpan: '2', colSpan: '3' } ],
					},
					{ cells: [] },
				],
				foot: [],
			} )
		);

		it( 'should split the merged cell with the correct indexes', () => {
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
			expect( () => splitMergedCells( vTable, [ vTable.body[ 0 ].cells[ 0 ] ] ) ).not.toThrow();
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
	} );

	describe( 'toVirtualTable / toTableAttributes round-trip', () => {
		// Every section mixes rowspan and colspan cells.
		// body (4x4), merged cells repeat the same letter:
		// | A | A | B | C |
		// | A | A | D | C |
		// | E | E | F | C |
		// | G | H | I | I |
		const attributes: TableAttributes = {
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

		it( 'should place cells and hidden cells at the right virtual positions', () => {
			const vTable = toVirtualTable( attributes );
			const toLayout = ( section: VRow[] ) =>
				section.map( ( row ) =>
					row.cells.map( ( cell ) => ( cell.isHidden ? null : cell.content ) )
				);

			expect( toLayout( vTable.head ) ).toStrictEqual( [ [ 'h-0', null, null, 'h-1' ] ] );
			expect( toLayout( vTable.body ) ).toStrictEqual( [
				[ 'A', null, 'B', 'C' ],
				[ null, null, 'D', null ],
				[ 'E', null, 'F', null ],
				[ 'G', 'H', 'I', null ],
			] );
			expect( toLayout( vTable.foot ) ).toStrictEqual( [ [ 'f-0', 'f-1', null, null ] ] );

			const { rowIndex, vColIndex, rowSpan, colSpan } = vTable.body[ 1 ].cells[ 2 ];
			expect( { rowIndex, vColIndex, rowSpan, colSpan } ).toStrictEqual( {
				rowIndex: 1,
				vColIndex: 2,
				rowSpan: 1,
				colSpan: 1,
			} );
		} );

		it( 'should restore the original table attributes and be stable when converted repeatedly', () => {
			const once = toTableAttributes( toVirtualTable( attributes ) );
			const twice = toTableAttributes( toVirtualTable( once ) );
			expect( once ).toEqual( attributes );
			expect( twice ).toStrictEqual( once );
		} );
	} );
} );
