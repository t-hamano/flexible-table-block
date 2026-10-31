/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { toTableAttributes, toVirtualTable } from '../../table-state';
import type { TableAttributes } from '../../../BlockAttributes';

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
