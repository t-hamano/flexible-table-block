import { createTable } from '../table-state';
import type { Cell } from '../VirtualTable';

describe( 'table-state', () => {
	describe( 'createTable', () => {
		const getCell = ( tag: 'th' | 'td' ): Cell => {
			return {
				content: '',
				tag,
			};
		};
		const row = {
			cells: [ getCell( 'td' ), getCell( 'td' ) ],
		};
		it( 'should create the right virtual table', () => {
			expect(
				createTable( { rowCount: 2, colCount: 2, headerSection: false, footerSection: false } )
			).toStrictEqual( {
				head: [],
				body: [ row, row ],
				foot: [],
			} );
		} );

		it( 'should create virtual table with head and foot', () => {
			expect(
				createTable( { rowCount: 2, colCount: 2, headerSection: true, footerSection: true } )
			).toStrictEqual( {
				head: [
					{
						cells: [ getCell( 'th' ), getCell( 'th' ) ],
					},
				],
				body: [ row, row ],
				foot: [ row ],
			} );
		} );
	} );
} );
