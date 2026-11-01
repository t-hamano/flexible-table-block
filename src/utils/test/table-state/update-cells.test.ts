/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { toTableAttributes, toVirtualTable, updateCells } from '../../table-state';
import { createVTable } from './fixtures';

describe( 'updateCells', () => {
	// | body-0-0 | body-0-1 |
	const createStyledVTable = () =>
		toVirtualTable( {
			head: [],
			body: [
				{
					cells: [
						{ content: 'body-0-0', tag: 'td', styles: 'color:red;', className: 'is-red' },
						{ content: 'body-0-1', tag: 'td' },
					],
				},
			],
			foot: [],
		} );

	it( 'should update the tag and attributes of only the selected cells', () => {
		const vTable = createVTable();
		// Change two body cells to header cells with attributes.
		const newVTable = updateCells(
			vTable,
			{ tag: 'th', className: 'is-header', id: 'cell-id', headers: 'head-0', scope: 'row' },
			[ vTable.body[ 0 ].cells[ 0 ], vTable.body[ 1 ].cells[ 1 ] ]
		);
		// Updated cells are marked with *.
		// | head-0    | head-1    | head-2   |
		// | body-0-0* | body-0-1  | body-0-2 |
		// | body-1-0  | body-1-1* | body-1-2 |
		// | body-2-0  | body-2-1  | body-2-2 |
		// | foot-0    | foot-1    | foot-2   |
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
							content: 'body-0-0',
							styles: '',
							tag: 'th',
							className: 'is-header',
							id: 'cell-id',
							headers: 'head-0',
							scope: 'row',
						},
						{ content: 'body-0-1', tag: 'td' },
						{ content: 'body-0-2', tag: 'td' },
					],
				},
				{
					cells: [
						{ content: 'body-1-0', tag: 'td' },
						{
							content: 'body-1-1',
							styles: '',
							tag: 'th',
							className: 'is-header',
							id: 'cell-id',
							headers: 'head-0',
							scope: 'row',
						},
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

	it( 'should add new styles to the existing styles', () => {
		const vTable = createStyledVTable();
		// Add a background color and padding to the first cell.
		const newVTable = updateCells(
			vTable,
			{
				styles: {
					backgroundColor: '#fff',
					padding: { top: '1px', right: '2px', bottom: '3px', left: '4px' },
				},
			},
			[ vTable.body[ 0 ].cells[ 0 ] ]
		);
		expect( toTableAttributes( newVTable ).body ).toEqual( [
			{
				cells: [
					{
						content: 'body-0-0',
						styles: 'color:red;background-color:#fff;padding:1px 2px 3px 4px;',
						tag: 'td',
						className: 'is-red',
					},
					{ content: 'body-0-1', tag: 'td' },
				],
			},
		] );
	} );

	it( 'should shorten border styles that are the same on all sides', () => {
		const vTable = createStyledVTable();
		// Add the same border width, style and color on all sides of the first cell.
		const newVTable = updateCells(
			vTable,
			{
				styles: {
					borderWidth: { top: '1px', right: '1px', bottom: '1px', left: '1px' },
					borderStyle: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
					borderColor: { top: '#000', right: '#000', bottom: '#000', left: '#000' },
				},
			},
			[ vTable.body[ 0 ].cells[ 0 ] ]
		);
		expect( toTableAttributes( newVTable ).body ).toEqual( [
			{
				cells: [
					{
						content: 'body-0-0',
						styles: 'color:red;border-width:1px;border-style:solid;border-color:#000;',
						tag: 'td',
						className: 'is-red',
					},
					{ content: 'body-0-1', tag: 'td' },
				],
			},
		] );
	} );

	it( 'should remove an attribute when it is updated with undefined', () => {
		const vTable = createStyledVTable();
		// Remove the class name from the first cell.
		const newVTable = updateCells( vTable, { className: undefined }, [
			vTable.body[ 0 ].cells[ 0 ],
		] );
		expect( toTableAttributes( newVTable ).body ).toEqual( [
			{
				cells: [
					{ content: 'body-0-0', styles: 'color:red;', tag: 'td' },
					{ content: 'body-0-1', tag: 'td' },
				],
			},
		] );
	} );
} );
