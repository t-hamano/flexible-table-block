/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { insertColumn, toTableAttributes, toVirtualTable } from '../../table-state';
import { createVTable, createMergedVTable } from './fixtures';

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
		expect( newVTable.body[ 0 ].cells.map( ( cell ) => cell.vColIndex ) ).toStrictEqual( [ 0, 1 ] );
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
