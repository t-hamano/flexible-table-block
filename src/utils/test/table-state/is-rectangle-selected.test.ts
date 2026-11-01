/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { isRectangleSelected } from '../../table-state';
import { createVTable, createMergedVTable } from './fixtures';

describe( 'isRectangleSelected', () => {
	it( 'should return false when no cell or only one cell is selected', () => {
		const vTable = createVTable();
		expect( isRectangleSelected( undefined ) ).toBe( false );
		expect( isRectangleSelected( [ vTable.body[ 0 ].cells[ 0 ] ] ) ).toBe( false );
	} );

	it( 'should return true when the selected cells form a rectangle', () => {
		const vTable = createVTable();
		// Select the top-left 2x2 body cells.
		// | body-0-0 | body-0-1 |          |
		// | body-1-0 | body-1-1 |          |
		// |          |          |          |
		const selectedCells = [
			vTable.body[ 0 ].cells[ 0 ],
			vTable.body[ 0 ].cells[ 1 ],
			vTable.body[ 1 ].cells[ 0 ],
			vTable.body[ 1 ].cells[ 1 ],
		];
		expect( isRectangleSelected( selectedCells ) ).toBe( true );
	} );

	it( 'should return false when the selected cells form an L shape', () => {
		const vTable = createVTable();
		// Select three of the top-left 2x2 body cells.
		// | body-0-0 | body-0-1 |          |
		// | body-1-0 |          |          |
		// |          |          |          |
		const selectedCells = [
			vTable.body[ 0 ].cells[ 0 ],
			vTable.body[ 0 ].cells[ 1 ],
			vTable.body[ 1 ].cells[ 0 ],
		];
		expect( isRectangleSelected( selectedCells ) ).toBe( false );
	} );

	it( 'should return false when the selected cells are not adjacent', () => {
		const vTable = createVTable();
		// Select the first and last cells of the first body row.
		// | body-0-0 |          | body-0-2 |
		// |          |          |          |
		// |          |          |          |
		const selectedCells = [ vTable.body[ 0 ].cells[ 0 ], vTable.body[ 0 ].cells[ 2 ] ];
		expect( isRectangleSelected( selectedCells ) ).toBe( false );
	} );

	it( 'should return true when a merged cell and other cells form a rectangle', () => {
		const vTable = createMergedVTable();
		// Select the merged cell and the two cells to its right.
		// Merged cells repeat the same name.
		// | body-0-0 | body-0-0 | body-0-2 |
		// | body-0-0 | body-0-0 | body-1-2 |
		// |          |          |          |
		const selectedCells = [
			vTable.body[ 0 ].cells[ 0 ],
			vTable.body[ 0 ].cells[ 2 ],
			vTable.body[ 1 ].cells[ 2 ],
		];
		expect( isRectangleSelected( selectedCells ) ).toBe( true );
	} );

	it( 'should return false when a merged cell and other cells do not form a rectangle', () => {
		const vTable = createMergedVTable();
		// Select the merged cell and only one of the two cells to its right.
		// Merged cells repeat the same name.
		// | body-0-0 | body-0-0 | body-0-2 |
		// | body-0-0 | body-0-0 |          |
		// |          |          |          |
		const selectedCells = [ vTable.body[ 0 ].cells[ 0 ], vTable.body[ 0 ].cells[ 2 ] ];
		expect( isRectangleSelected( selectedCells ) ).toBe( false );
	} );

	it( 'should return false when the selected cells are in different sections', () => {
		const vTable = createVTable();
		// Select the first header cell and the first body cell.
		// | head-0   |          |          |
		// | body-0-0 |          |          |
		// |          |          |          |
		// |          |          |          |
		const selectedCells = [ vTable.head[ 0 ].cells[ 0 ], vTable.body[ 0 ].cells[ 0 ] ];
		expect( isRectangleSelected( selectedCells ) ).toBe( false );
	} );
} );
