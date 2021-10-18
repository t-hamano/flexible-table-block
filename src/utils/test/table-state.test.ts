import {
	createTable,
	deleteRow,
	insertRow,
	VCell,
	VRow,
	SectionName,
	VTable,
} from '../table-state';
import { times } from 'lodash';

const getRow = (
	cells: number,
	sectionName: SectionName,
	rowIndex: number,
	tag: 'th' | 'td',
	content = '',
	options = {}
): VRow => {
	return {
		cells: times(
			cells,
			( colIndex ): VCell => {
				return {
					content,
					tag,
					vColIndex: colIndex,
					rowIndex,
					colIndex,
					sectionName,
					rowSpan: 1,
					colSpan: 1,
					isDelete: false,
					isFirstSelected: false,
					...options,
				};
			}
		),
	};
};

const table: VTable = {
	head: [ getRow( 2, 'head', 0, 'th', 'head' ) ],
	body: [ getRow( 2, 'body', 0, 'td', 'body-0' ), getRow( 2, 'body', 1, 'td', 'body-1' ) ],
	foot: [ getRow( 2, 'foot', 0, 'td', 'foot' ) ],
};

describe( 'table-state', () => {
	describe( 'createTable', () => {
		it( 'should create the right virtual table', () => {
			expect(
				createTable( { rowCount: 2, colCount: 2, headerSection: false, footerSection: false } )
			).toStrictEqual( {
				head: [],
				body: [ getRow( 2, 'body', 0, 'td' ), getRow( 2, 'body', 1, 'td' ) ],
				foot: [],
			} );
		} );

		it( 'should create virtual table with head and foot', () => {
			expect(
				createTable( { rowCount: 2, colCount: 2, headerSection: true, footerSection: true } )
			).toStrictEqual( {
				head: [ getRow( 2, 'head', 0, 'th' ) ],
				body: [ getRow( 2, 'body', 0, 'td' ), getRow( 2, 'body', 1, 'td' ) ],
				foot: [ getRow( 2, 'foot', 0, 'td' ) ],
			} );
		} );
	} );

	describe( 'insertRow', () => {
		it( 'should return the table with the correct number of rows', () => {
			expect( insertRow( { ...table }, { sectionName: 'body', rowIndex: 1 } ) ).toStrictEqual( {
				head: [ getRow( 2, 'head', 0, 'th', 'head' ) ],
				body: [
					getRow( 2, 'body', 0, 'td', 'body-0' ),
					getRow( 2, 'body', 1, 'td', '' ),
					getRow( 2, 'body', 2, 'td', 'body-1' ),
				],
				foot: [ getRow( 2, 'foot', 0, 'td', 'foot' ) ],
			} );
		} );
	} );

	describe( 'deleteRow', () => {
		it( 'should return the table with the correct number of rows', () => {
			expect( deleteRow( { ...table }, { sectionName: 'body', rowIndex: 0 } ) ).toStrictEqual( {
				head: [ getRow( 2, 'head', 0, 'th', 'head' ) ],
				body: [
					getRow( 2, 'body', 0, 'td', 'body-0', { isDelete: true } ),
					getRow( 2, 'body', 1, 'td', 'body-1' ),
				],
				foot: [ getRow( 2, 'foot', 0, 'td', 'foot' ) ],
			} );
		} );
	} );
} );
