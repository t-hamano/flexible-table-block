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

const table: VTable = {
	head: [ getRow( 3, 'head', 0, 'th', 'head' ) ],
	body: [
		getRow( 3, 'body', 0, 'td', 'body-0' ),
		getRow( 3, 'body', 1, 'td', 'body-1' ),
		getRow( 3, 'body', 2, 'td', 'body-2' ),
	],
	foot: [ getRow( 3, 'foot', 0, 'td', 'foot' ) ],
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
		it( 'should return the table with the correct number of rows', () => {
			expect( insertRow( { ...table }, { sectionName: 'body', rowIndex: 1 } ) ).toStrictEqual( {
				head: [ getRow( 3, 'head', 0, 'th', 'head' ) ],
				body: [
					getRow( 3, 'body', 0, 'td', 'body-0' ),
					getRow( 3, 'body', 1, 'td', '' ),
					getRow( 3, 'body', 2, 'td', 'body-1' ),
					getRow( 3, 'body', 3, 'td', 'body-2' ),
				],
				foot: [ getRow( 3, 'foot', 0, 'td', 'foot' ) ],
			} );
			expect( insertRow( { ...table }, { sectionName: 'body', rowIndex: 3 } ) ).toStrictEqual( {
				head: [ getRow( 3, 'head', 0, 'th', 'head' ) ],
				body: [
					getRow( 3, 'body', 0, 'td', 'body-0' ),
					getRow( 3, 'body', 1, 'td', 'body-1' ),
					getRow( 3, 'body', 2, 'td', 'body-2' ),
					getRow( 3, 'body', 3, 'td', '' ),
				],
				foot: [ getRow( 3, 'foot', 0, 'td', 'foot' ) ],
			} );
		} );
	} );

	describe( 'deleteRow', () => {
		it( 'should return the table with the correct number of rows', () => {
			expect( deleteRow( { ...table }, { sectionName: 'body', rowIndex: 0 } ) ).toStrictEqual( {
				head: [ getRow( 3, 'head', 0, 'th', 'head' ) ],
				body: [ getRow( 3, 'body', 0, 'td', 'body-1' ), getRow( 3, 'body', 1, 'td', 'body-2' ) ],
				foot: [ getRow( 3, 'foot', 0, 'td', 'foot' ) ],
			} );
			expect( deleteRow( { ...table }, { sectionName: 'body', rowIndex: 1 } ) ).toStrictEqual( {
				head: [ getRow( 3, 'head', 0, 'th', 'head' ) ],
				body: [ getRow( 3, 'body', 0, 'td', 'body-0' ), getRow( 3, 'body', 1, 'td', 'body-2' ) ],
				foot: [ getRow( 3, 'foot', 0, 'td', 'foot' ) ],
			} );
		} );
	} );

	describe( 'deleteColumn', () => {
		it( 'should return the table with the correct number of columns', () => {
			expect( deleteColumn( { ...table }, { vColIndex: 0 } ) ).toStrictEqual( {
				head: [ getRow( 2, 'head', 0, 'th', 'head' ) ],
				body: [
					getRow( 2, 'body', 0, 'td', 'body-0' ),
					getRow( 2, 'body', 1, 'td', 'body-1' ),
					getRow( 2, 'body', 2, 'td', 'body-2' ),
				],
				foot: [ getRow( 2, 'foot', 0, 'td', 'foot' ) ],
			} );
			expect( deleteColumn( { ...table }, { vColIndex: 2 } ) ).toStrictEqual( {
				head: [ getRow( 2, 'head', 0, 'th', 'head' ) ],
				body: [
					getRow( 2, 'body', 0, 'td', 'body-0' ),
					getRow( 2, 'body', 1, 'td', 'body-1' ),
					getRow( 2, 'body', 2, 'td', 'body-2' ),
				],
				foot: [ getRow( 2, 'foot', 0, 'td', 'foot' ) ],
			} );
		} );
	} );

	describe( 'insertColumn', () => {
		it( 'should give the correct virtual column index to the cell inserted after the last column', () => {
			const vTable = deepFreeze( {
				head: [],
				body: [ getRow( 1, 'body', 0, 'td', 'body-0' ) ],
				foot: [],
			} );
			const newVTable = insertColumn( vTable, { vColIndex: 1 } );
			expect( newVTable.body[ 0 ].cells.map( ( cell ) => cell.vColIndex ) ).toStrictEqual( [
				0, 1,
			] );
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

	describe( 'row and column operations across merged cells', () => {
		// body (3x3), merged cells repeat the same letter:
		// | A | A | B |
		// | A | A | C |
		// | D | E | F |
		const vTable = deepFreeze(
			toVirtualTable( {
				head: [],
				body: [
					{
						cells: [
							{ content: 'A', tag: 'td', rowSpan: '2', colSpan: '2' },
							{ content: 'B', tag: 'td' },
						],
					},
					{ cells: [ { content: 'C', tag: 'td' } ] },
					{
						cells: [
							{ content: 'D', tag: 'td' },
							{ content: 'E', tag: 'td' },
							{ content: 'F', tag: 'td' },
						],
					},
				],
				foot: [],
			} )
		);

		// Convert the body to a compact layout, e.g. `A(2x2)` for a cell with rowspan 2 and colspan 2.
		const toLayout = ( newVTable: VTable ) =>
			toTableAttributes( newVTable ).body.map( ( row ) =>
				row.cells.map( ( { content, rowSpan, colSpan } ) =>
					rowSpan || colSpan ? `${ content }(${ rowSpan ?? 1 }x${ colSpan ?? 1 })` : content
				)
			);

		it( 'should expand the rowspan when inserting a row inside a merged cell', () => {
			expect( toLayout( insertRow( vTable, { sectionName: 'body', rowIndex: 1 } ) ) ).toStrictEqual(
				[ [ 'A(3x2)', 'B' ], [ '' ], [ 'C' ], [ 'D', 'E', 'F' ] ]
			);
		} );

		it( 'should not expand the rowspan when inserting a row right after a merged cell', () => {
			expect( toLayout( insertRow( vTable, { sectionName: 'body', rowIndex: 2 } ) ) ).toStrictEqual(
				[ [ 'A(2x2)', 'B' ], [ 'C' ], [ '', '', '' ], [ 'D', 'E', 'F' ] ]
			);
		} );

		it( 'should expand the colspan when inserting a column inside a merged cell', () => {
			expect( toLayout( insertColumn( vTable, { vColIndex: 1 } ) ) ).toStrictEqual( [
				[ 'A(2x3)', 'B' ],
				[ 'C' ],
				[ 'D', '', 'E', 'F' ],
			] );
		} );

		it( 'should not expand the colspan when inserting a column right after a merged cell', () => {
			expect( toLayout( insertColumn( vTable, { vColIndex: 2 } ) ) ).toStrictEqual( [
				[ 'A(2x2)', '', 'B' ],
				[ '', 'C' ],
				[ 'D', 'E', '', 'F' ],
			] );
		} );

		it( 'should split the merged cell when deleting the row where it starts', () => {
			expect( toLayout( deleteRow( vTable, { sectionName: 'body', rowIndex: 0 } ) ) ).toStrictEqual(
				[
					[ '', '', 'C' ],
					[ 'D', 'E', 'F' ],
				]
			);
		} );

		it( 'should contract the rowspan when deleting a row inside a merged cell', () => {
			expect( toLayout( deleteRow( vTable, { sectionName: 'body', rowIndex: 1 } ) ) ).toStrictEqual(
				[
					[ 'A(1x2)', 'B' ],
					[ 'D', 'E', 'F' ],
				]
			);
		} );

		it( 'should split the merged cell when deleting the column where it starts', () => {
			expect( toLayout( deleteColumn( vTable, { vColIndex: 0 } ) ) ).toStrictEqual( [
				[ '', 'B' ],
				[ '', 'C' ],
				[ 'E', 'F' ],
			] );
		} );

		it( 'should contract the colspan when deleting a column inside a merged cell', () => {
			expect( toLayout( deleteColumn( vTable, { vColIndex: 1 } ) ) ).toStrictEqual( [
				[ 'A(2x1)', 'B' ],
				[ 'C' ],
				[ 'D', 'F' ],
			] );
		} );
	} );
} );
