/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { mergeCells, toTableAttributes } from '../../table-state';
import { createVTable, createMergedVTable } from './fixtures';

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
