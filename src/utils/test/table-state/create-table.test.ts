/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { createTable, type VRow, type VCell } from '../../table-state';
import type { SectionName } from '../../../BlockAttributes';

const getRow = (
	cells: number,
	sectionName: SectionName,
	rowIndex: number,
	tag: 'th' | 'td',
	content = '',
	options = {}
): VRow => {
	return {
		cells: Array.from( { length: cells } ).map( ( _, vColIndex ): VCell => {
			return {
				content,
				tag,
				rowIndex,
				vColIndex,
				sectionName,
				rowSpan: 1,
				colSpan: 1,
				isHidden: false,
				isFirstSelected: false,
				...options,
			};
		} ),
	};
};

describe( 'createTable', () => {
	it( 'should create the right virtual table', () => {
		// |   |   |   |
		// |   |   |   |
		// |   |   |   |
		expect(
			createTable( { rowCount: 3, colCount: 3, headerSection: false, footerSection: false } )
		).toStrictEqual( {
			head: [],
			body: [
				getRow( 3, 'body', 0, 'td' ),
				getRow( 3, 'body', 1, 'td' ),
				getRow( 3, 'body', 2, 'td' ),
			],
			foot: [],
		} );
	} );

	it( 'should create virtual table with head and foot', () => {
		// |   |   |   | (head)
		// |   |   |   |
		// |   |   |   |
		// |   |   |   |
		// |   |   |   | (foot)
		expect(
			createTable( { rowCount: 3, colCount: 3, headerSection: true, footerSection: true } )
		).toStrictEqual( {
			head: [ getRow( 3, 'head', 0, 'th' ) ],
			body: [
				getRow( 3, 'body', 0, 'td' ),
				getRow( 3, 'body', 1, 'td' ),
				getRow( 3, 'body', 2, 'td' ),
			],
			foot: [ getRow( 3, 'foot', 0, 'td' ) ],
		} );
	} );
} );
