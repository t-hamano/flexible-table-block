/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { toggleSection, toTableAttributes } from '../../table-state';
import { createVTable, createMergedVTable } from './fixtures';

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
