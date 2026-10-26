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
	toVirtualTable,
	type VTable,
	type VRow,
	type VCell,
} from '../table-state';
import type { SectionName } from '../../BlockAttributes';

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
} );
