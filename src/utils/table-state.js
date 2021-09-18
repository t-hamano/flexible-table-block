/**
 * External dependencies
 */
import { times, get, mapValues, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { isEmptyTableSection, isEmptyRow, isCellSelected, getFirstRow } from './helper';

const INHERITED_COLUMN_ATTRIBUTES = [ 'align' ];

/**
 * Creates a table state.
 *
 * @param {Object}  options
 * @param {number}  options.rowCount      Row count for the table to create.
 * @param {number}  options.columnCount   Column count for the table to create.
 * @param {boolean} options.headerSection With/without header section.
 * @param {boolean} options.footerSection With/without footer section.
 * @return {Object} New table state.
 */
export function createTable( { rowCount, columnCount, headerSection, footerSection } ) {
	return {
		...( headerSection && {
			head: [
				{
					cells: times( columnCount, () => ( {
						content: '',
						tag: 'th',
					} ) ),
				},
			],
		} ),
		body: times( rowCount, () => ( {
			cells: times( columnCount, () => ( {
				content: '',
				tag: 'td',
			} ) ),
		} ) ),
		...( footerSection && {
			foot: [
				{
					cells: times( columnCount, () => ( {
						content: '',
						tag: 'td',
					} ) ),
				},
			],
		} ),
	};
}

/**
 * Returns updated cell attributes after applying the `updateCell` function to the selection.
 *
 * @param {Object}   state      The block attributes.
 * @param {Object}   selection  The selection of cells to update.
 * @param {Function} updateCell A function to update the selected cell attributes.
 * @return {Object} New table state including the updated cells.
 */
export function updateSelectedCell( state, selection, updateCell ) {
	if ( ! selection ) {
		return state;
	}

	const tableSections = pick( state, [ 'head', 'body', 'foot' ] );
	const { sectionName: selectionSectionName, rowIndex: selectionRowIndex } = selection;

	return mapValues( tableSections, ( section, sectionName ) => {
		if ( selectionSectionName && selectionSectionName !== sectionName ) {
			return section;
		}

		return section.map( ( row, rowIndex ) => {
			if ( selectionRowIndex && selectionRowIndex !== rowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cellAttributes, columnIndex ) => {
					const cellLocation = {
						sectionName,
						columnIndex,
						rowIndex,
					};

					if ( ! isCellSelected( cellLocation, selection ) ) {
						return cellAttributes;
					}

					return updateCell( cellAttributes );
				} ),
			};
		} );
	} );
}

/**
 * Inserts a row in the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to insert the row.
 * @param {number} options.rowIndex    Row index at which to insert the row.
 * @param {number} options.columnCount Column count for the table to create.
 * @return {Object} New table state.
 */
export function insertRow( state, { sectionName, rowIndex, columnCount } ) {
	const firstRow = getFirstRow( state );
	const cellCount =
		columnCount === undefined ? get( firstRow, [ 'cells', 'length' ] ) : columnCount;

	// Bail early if the function cannot determine how many cells to add.
	if ( ! cellCount ) {
		return state;
	}

	return {
		[ sectionName ]: [
			...state[ sectionName ].slice( 0, rowIndex ),
			{
				cells: times( cellCount, ( index ) => {
					const firstCellInColumn = get( firstRow, [ 'cells', index ], {} );
					const inheritedAttributes = pick( firstCellInColumn, INHERITED_COLUMN_ATTRIBUTES );

					return {
						...inheritedAttributes,
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
					};
				} ),
			},
			...state[ sectionName ].slice( rowIndex ),
		],
	};
}

/**
 * Deletes a row from the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {string} options.sectionName Section in which to delete the row.
 * @param {number} options.rowIndex    Row index to delete.
 * @return {Object} New table state.
 */
export function deleteRow( state, { sectionName, rowIndex } ) {
	return {
		[ sectionName ]: state[ sectionName ].filter( ( row, index ) => index !== rowIndex ),
	};
}

/**
 * Inserts a column in the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {number} options.columnIndex Column index at which to insert the column.
 * @return {Object} New table state.
 */
export function insertColumn( state, { columnIndex } ) {
	const tableSections = pick( state, [ 'head', 'body', 'foot' ] );

	return mapValues( tableSections, ( section, sectionName ) => {
		// Bail early if the table section is empty.
		if ( isEmptyTableSection( section ) ) {
			return section;
		}

		return section.map( ( row ) => {
			// Bail early if the row is empty or it's an attempt to insert past
			// the last possible index of the array.
			if ( isEmptyRow( row ) || row.cells.length < columnIndex ) {
				return row;
			}

			return {
				cells: [
					...row.cells.slice( 0, columnIndex ),
					{
						content: '',
						tag: 'head' === sectionName ? 'th' : 'td',
					},
					...row.cells.slice( columnIndex ),
				],
			};
		} );
	} );
}

/**
 * Deletes a column from the table state.
 *
 * @param {Object} state               Current table state.
 * @param {Object} options
 * @param {number} options.columnIndex Column index to delete.
 * @return {Object} New table state.
 */
export function deleteColumn( state, { columnIndex } ) {
	const tableSections = pick( state, [ 'head', 'body', 'foot' ] );

	return mapValues( tableSections, ( section ) => {
		// Bail early if the table section is empty.
		if ( isEmptyTableSection( section ) ) {
			return section;
		}

		return section
			.map( ( row ) => ( {
				cells:
					row.cells.length >= columnIndex
						? row.cells.filter( ( cell, index ) => index !== columnIndex )
						: row.cells,
			} ) )
			.filter( ( row ) => row.cells.length );
	} );
}

/**
 * Toggles the existance of a section.
 *
 * @param {Object} state       Current table state.
 * @param {string} sectionName Name of the section to toggle.
 * @return {Object} New table state.
 */
export function toggleSection( state, sectionName ) {
	// Section exists, replace it with an empty row to remove it.
	if ( ! isEmptyTableSection( state[ sectionName ] ) ) {
		return { [ sectionName ]: [] };
	}

	// Get the length of the first row of the body to use when creating the header.
	const columnCount = get( state, [ 'body', 0, 'cells', 'length' ], 1 );

	// Section doesn't exist, insert an empty row to create the section.
	return insertRow( state, { sectionName, rowIndex: 0, columnCount } );
}
