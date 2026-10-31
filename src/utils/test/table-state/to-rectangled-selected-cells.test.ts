/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { toRectangledSelectedCells, toVirtualTable, type VTable } from '../../table-state';
import type { CellTagValue } from '../../../BlockAttributes';

type Cell = { content: string; tag: CellTagValue; rowSpan?: string; colSpan?: string };

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

// In the table diagrams below, merged cells repeat the same name.
describe( 'toRectangledSelectedCells', () => {
	it( 'should return an empty array when the cells are in different sections', () => {
		// | A | B | (head)
		// | C | D |
		const vTable = toVirtualTable( {
			head: [
				{
					cells: [
						{ content: 'A', tag: 'th' },
						{ content: 'B', tag: 'th' },
					],
				},
			],
			body: [ { cells: [ td( 'C' ), td( 'D' ) ] } ],
			foot: [],
		} );
		expect(
			toRectangledSelectedCells( vTable, {
				fromCell: vTable.head[ 0 ].cells[ 0 ],
				toCell: getCell( vTable, 'D' ),
			} )
		).toStrictEqual( [] );
	} );

	it( 'should select the cells between the two cells without merged cells', () => {
		// | A | B | C |
		// | D | E | F |
		// | G | H | I |
		const vTable = toVirtualTable( {
			head: [],
			body: [
				{ cells: [ td( 'A' ), td( 'B' ), td( 'C' ) ] },
				{ cells: [ td( 'D' ), td( 'E' ), td( 'F' ) ] },
				{ cells: [ td( 'G' ), td( 'H' ), td( 'I' ) ] },
			],
			foot: [],
		} );
		expect( select( vTable, 'E', 'I' ) ).toStrictEqual( [ 'E', 'F', 'H', 'I' ] );
		expect( select( vTable, 'I', 'E' ) ).toStrictEqual( [ 'E', 'F', 'H', 'I' ] );
	} );

	it( 'should mark the first selected cell', () => {
		// | A | B |
		// | C | D |
		const vTable = toVirtualTable( {
			head: [],
			body: [ { cells: [ td( 'A' ), td( 'B' ) ] }, { cells: [ td( 'C' ), td( 'D' ) ] } ],
			foot: [],
		} );
		const cells = toRectangledSelectedCells( vTable, {
			fromCell: getCell( vTable, 'D' ),
			toCell: getCell( vTable, 'A' ),
		} );
		expect(
			cells.filter( ( cell ) => cell.isFirstSelected ).map( ( cell ) => cell.content )
		).toStrictEqual( [ 'D' ] );
	} );

	it( 'should expand to the left when a merged cell crosses the left edge', () => {
		// | A | A | B |
		// | C | D | E |
		const vTable = toVirtualTable( {
			head: [],
			body: [
				{ cells: [ td( 'A', { colSpan: 2 } ), td( 'B' ) ] },
				{ cells: [ td( 'C' ), td( 'D' ), td( 'E' ) ] },
			],
			foot: [],
		} );
		expect( select( vTable, 'D', 'B' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'B', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should expand to the right when a merged cell crosses the right edge', () => {
		// | A | B | B |
		// | C | D | E |
		const vTable = toVirtualTable( {
			head: [],
			body: [
				{ cells: [ td( 'A' ), td( 'B', { colSpan: 2 } ) ] },
				{ cells: [ td( 'C' ), td( 'D' ), td( 'E' ) ] },
			],
			foot: [],
		} );
		expect( select( vTable, 'D', 'A' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'A', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should expand to the top when a merged cell crosses the top edge', () => {
		// | A | B |
		// | C | B |
		// | D | E |
		const vTable = toVirtualTable( {
			head: [],
			body: [
				{ cells: [ td( 'A' ), td( 'B', { rowSpan: 2 } ) ] },
				{ cells: [ td( 'C' ) ] },
				{ cells: [ td( 'D' ), td( 'E' ) ] },
			],
			foot: [],
		} );
		expect( select( vTable, 'C', 'E' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'E', 'C' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should expand to the bottom when a merged cell crosses the bottom edge', () => {
		// | A | B |
		// | C | D |
		// | C | E |
		const vTable = toVirtualTable( {
			head: [],
			body: [
				{ cells: [ td( 'A' ), td( 'B' ) ] },
				{ cells: [ td( 'C', { rowSpan: 2 } ), td( 'D' ) ] },
				{ cells: [ td( 'E' ) ] },
			],
			foot: [],
		} );
		expect( select( vTable, 'A', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
		expect( select( vTable, 'D', 'A' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E' ] );
	} );

	it( 'should keep expanding while a newly included merged cell crosses an edge', () => {
		// | A | B | B |
		// | C | D | E |
		// | F | G | E |
		// Selecting A to D pulls in B (right), and then E, which crosses the new bottom edge.
		const vTable = toVirtualTable( {
			head: [],
			body: [
				{ cells: [ td( 'A' ), td( 'B', { colSpan: 2 } ) ] },
				{ cells: [ td( 'C' ), td( 'D' ), td( 'E', { rowSpan: 2 } ) ] },
				{ cells: [ td( 'F' ), td( 'G' ) ] },
			],
			foot: [],
		} );
		expect( select( vTable, 'A', 'D' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] );
		expect( select( vTable, 'D', 'A' ) ).toStrictEqual( [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] );
	} );
} );
