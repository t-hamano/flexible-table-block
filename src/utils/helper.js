/**
 * External dependencies
 */
import { every } from 'lodash';

/**
 * Sanitize the value of UnitControl.
 *
 * @param {string} value UnitControl value.
 *
 * @return {string} Sanitized UnitControl value.
 */
export function toUnitVal( value ) {
	return ( isNaN( parseFloat( value ) ) || 0 > parseFloat( value ) ) ? undefined : value;
}

/**
 * Gets styles for table.
 *
 * @param {Object} attributes Table attributes.
 *
 * @return {Object} Table style.
 */
export function getTableStyle( attributes ) {
	const { borderCollapse, width, minWidth, maxWidth } = attributes;
	const borderSpacingHorizontal = undefined === attributes.borderSpacingHorizontal ? 0 : attributes.borderSpacingHorizontal;
	const borderSpacingVertical = undefined === attributes.borderSpacingVertical ? 0 : attributes.borderSpacingVertical;

	let styles = { width, minWidth, maxWidth };

	if ( ( 'collapse' === borderCollapse ) || ( 0 === borderSpacingHorizontal && 0 === borderSpacingVertical ) ) {
		return styles;
	}

	styles.borderCollapse = 'separate';
	styles.borderSpacing = `${borderSpacingHorizontal} ${borderSpacingVertical}`;
	return styles;
}

/**
 * Determines whether a table row is empty.
 *
 * @param {Object} row Table row state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyRow( row ) {
	return ! ( row.cells && row.cells.length );
}

/**
 * Determines whether a table section is empty.
 *
 * @param {Object} section Table section state.
 *
 * @return {boolean} True if the table section is empty, false otherwise.
 */
export function isEmptyTableSection( section ) {
	return ! section || ! section.length || every( section, isEmptyRow );
}

/**
 * Returns whether the cell at `cellLocation` is included in the selection `selection`.
 *
 * @param {Object} cellLocation An object containing cell location properties.
 * @param {Object} selection    An object containing selection properties.
 *
 * @return {boolean} True if the cell is selected, false otherwise.
 */
export function isCellSelected( cellLocation, selection ) {
	if ( ! cellLocation || ! selection ) {
		return false;
	}

	switch ( selection.type ) {
		case 'column':
			return (
				'column' === selection.type &&
				cellLocation.columnIndex === selection.columnIndex
			);
		case 'cell':
			return (
				'cell' === selection.type &&
				cellLocation.sectionName === selection.sectionName &&
				cellLocation.columnIndex === selection.columnIndex &&
				cellLocation.rowIndex === selection.rowIndex
			);
	}
}

/**
 * Returns the first row in the table.
 *
 * @param {Object} state Current table state.
 *
 * @return {Object} The first table row.
 */
export function getFirstRow( state ) {
	if ( ! isEmptyTableSection( state.head ) ) {
		return state.head[ 0 ];
	}
	if ( ! isEmptyTableSection( state.body ) ) {
		return state.body[ 0 ];
	}
	if ( ! isEmptyTableSection( state.foot ) ) {
		return state.foot[ 0 ];
	}
}
