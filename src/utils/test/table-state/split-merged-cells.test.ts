/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { mergeCells, splitMergedCells, toTableAttributes, toVirtualTable } from '../../table-state';
import { createVTable } from './fixtures';

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
