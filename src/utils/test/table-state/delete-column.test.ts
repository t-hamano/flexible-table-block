/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { deleteColumn, toTableAttributes } from '../../table-state';
import { createVTable, createMergedVTable } from './fixtures';

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
