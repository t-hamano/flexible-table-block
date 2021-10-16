import { createTable, insertRow } from '../table-state';
import type { Cell, Row, VirtualTable } from '../VirtualTable';
import { times } from 'lodash';

const getCell = ( tag: 'th' | 'td', content = '' ): Cell => {
	return {
		content,
		tag,
	};
};

const getRow = ( cells: number, tag: 'th' | 'td', content = '' ): Row => {
	return {
		cells: times( cells, () => getCell( tag, content ) ),
	};
};

describe( 'table-state', () => {
	describe( 'createTable', () => {
		it( 'should create the right virtual table', () => {
			expect(
				createTable( { rowCount: 2, colCount: 2, headerSection: false, footerSection: false } )
			).toStrictEqual( {
				head: [],
				body: [ getRow( 2, 'td' ), getRow( 2, 'td' ) ],
				foot: [],
			} );
		} );

		it( 'should create virtual table with head and foot', () => {
			expect(
				createTable( { rowCount: 2, colCount: 2, headerSection: true, footerSection: true } )
			).toStrictEqual( {
				head: [ getRow( 2, 'th' ) ],
				body: [ getRow( 2, 'td' ), getRow( 2, 'td' ) ],
				foot: [ getRow( 2, 'td' ) ],
			} );
		} );
	} );

	describe( 'insertRow', () => {
		const table: VirtualTable = {
			head: [ getRow( 2, 'th', 'head' ) ],
			body: [ getRow( 2, 'td', 'body' ), getRow( 2, 'td', 'body' ) ],
			foot: [ getRow( 2, 'td', 'foot' ) ],
		};
		it( 'should return the table with the correct number of rows', () => {
			expect( insertRow( table, { sectionName: 'body', rowIndex: 1 } ) ).toStrictEqual( {
				// head: [ getRow( 2, 'th', 'head' ) ],
				body: [ getRow( 2, 'td', 'body' ), getRow( 2, 'td', '' ), getRow( 2, 'td', 'body' ) ],
				// foot: [ getRow( 2, 'td', 'foot' ) ],
			} );
		} );
	} );
} );
