/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { toRectangledSelectedCells, toVirtualTable, type VTable } from '../../table-state';
import type { CellTagValue } from '../../../BlockAttributes';
import { createVTable } from './fixtures';

type Cell = { content: string; tag: CellTagValue; rowSpan?: string; colSpan?: string };

// Creates a virtual table with only a body section.
const createBodyVTable = ( rows: Cell[][] ): VTable =>
	toVirtualTable( {
		head: [],
		body: rows.map( ( cells ) => ( { cells } ) ),
		foot: [],
	} );

const td = ( content: string, span: { rowSpan?: number; colSpan?: number } = {} ): Cell => ( {
	content,
	tag: 'td',
	...( span.rowSpan && { rowSpan: String( span.rowSpan ) } ),
	...( span.colSpan && { colSpan: String( span.colSpan ) } ),
} );

// Finds a visible body cell by its content.
const getCell = ( vTable: VTable, content: string ) => {
	const cell = vTable.body
		.flatMap( ( row ) => row.cells )
		.find( ( vCell ) => ! vCell.isHidden && vCell.content === content );
	if ( ! cell ) {
		throw new Error( `Cell "${ content }" not found.` );
	}
	return cell;
};

// Returns the contents of the cells in the rectangled selection, sorted.
const select = ( vTable: VTable, from: string, to: string ) =>
	toRectangledSelectedCells( vTable, {
		fromCell: getCell( vTable, from ),
		toCell: getCell( vTable, to ),
	} )
		.map( ( cell ) => cell.content )
		.sort();

describe( 'toRectangledSelectedCells', () => {
	it( 'should return an empty array when the cells are in different sections', () => {
		const vTable = createVTable();
		expect(
			toRectangledSelectedCells( vTable, {
				fromCell: vTable.head[ 0 ].cells[ 0 ],
				toCell: vTable.body[ 0 ].cells[ 0 ],
			} )
		).toStrictEqual( [] );
	} );

	it( 'should select the cells between the two cells without merged cells', () => {
		// | A | B | C |
		// | D | E | F |
		// | G | H | I |
		const vTable = createBodyVTable( [
			[ td( 'A' ), td( 'B' ), td( 'C' ) ],
			[ td( 'D' ), td( 'E' ), td( 'F' ) ],
			[ td( 'G' ), td( 'H' ), td( 'I' ) ],
		] );
		expect( select( vTable, 'E', 'I' ) ).toStrictEqual( [ 'E', 'F', 'H', 'I' ] );
		expect( select( vTable, 'I', 'E' ) ).toStrictEqual( [ 'E', 'F', 'H', 'I' ] );
	} );

	it( 'should mark the first selected cell', () => {
		const vTable = createVTable();
		const cells = toRectangledSelectedCells( vTable, {
			fromCell: vTable.body[ 1 ].cells[ 1 ],
			toCell: vTable.body[ 0 ].cells[ 0 ],
		} );
		expect(
			cells.filter( ( cell ) => cell.isFirstSelected ).map( ( cell ) => cell.content )
		).toStrictEqual( [ 'body-1-1' ] );
	} );

	it( 'should expand to the left when a merged cell crosses the left edge', () => {
		// | A     A | B |
		// | C | D   | E |
		const vTable = createBodyVTable( [
			[ td( 'A', { colSpan: 2 } ), td( 'B' ) ],
			[ td( 'C' ), td( 'D' ), td( 'E' ) ],
		] );
		expect( select( vTable, 'D', 'B' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'B', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should expand to the right when a merged cell crosses the right edge', () => {
		// | A | B     B |
		// | C | D | E   |
		const vTable = createBodyVTable( [
			[ td( 'A' ), td( 'B', { colSpan: 2 } ) ],
			[ td( 'C' ), td( 'D' ), td( 'E' ) ],
		] );
		expect( select( vTable, 'D', 'A' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'A', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should expand to the top when a merged cell crosses the top edge', () => {
		// | A | B |
		// | C | B |
		// | D | E |
		const vTable = createBodyVTable( [
			[ td( 'A' ), td( 'B', { rowSpan: 2 } ) ],
			[ td( 'C' ) ],
			[ td( 'D' ), td( 'E' ) ],
		] );
		expect( select( vTable, 'C', 'E' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'E', 'C' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should expand to the bottom when a merged cell crosses the bottom edge', () => {
		// | A | B |
		// | C | D |
		// | C | E |
		const vTable = createBodyVTable( [
			[ td( 'A' ), td( 'B' ) ],
			[ td( 'C', { rowSpan: 2 } ), td( 'D' ) ],
			[ td( 'E' ) ],
		] );
		expect( select( vTable, 'A', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'D', 'A' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should keep expanding while a newly included merged cell crosses an edge', () => {
		// | A | B     B |
		// | C | D | E   |
		// | F | G | E   |
		// Selecting A to D pulls in B (right), and then E, which crosses the new bottom edge.
		const vTable = createBodyVTable( [
			[ td( 'A' ), td( 'B', { colSpan: 2 } ) ],
			[ td( 'C' ), td( 'D' ), td( 'E', { rowSpan: 2 } ) ],
			[ td( 'F' ), td( 'G' ) ],
		] );
		expect( select( vTable, 'A', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] );
	} );
} );
