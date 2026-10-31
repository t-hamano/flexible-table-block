/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { insertRow, toTableAttributes } from '../../table-state';
import { createVTable, createMergedVTable } from './fixtures';

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
