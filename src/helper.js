/**
 * External dependencies
 */
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import { PREVIEW_TABLE_HEIGHT_MIN } from './constants';

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
 * @param {Object}  options
 * @param {number}  options.rowCount    Row count for the table to preview.
 * @param {number}  options.columnCount Column count for the table to preview.
 * @param {boolean} options.hasHeader   With/without header section.
 * @param {boolean} options.hasFooter   With/without footer section.
 *
 * @return {Object} Table style.
 */
export function previewTable({rowCount, columnCount, hasHeader, hasFooter }) {

	const cellheight = Math.max( 2, parseInt( PREVIEW_TABLE_HEIGHT_MIN / ( rowCount + Number( hasHeader ) + Number( hasFooter ) ) ) );

	return (
		<table className="wp-block-ftb-table__placeholder-table">
			{ hasHeader && (
				<thead>
					<tr>
						{ times( columnCount, ( columnIndex ) => (
							<th key={ columnIndex } style={ { height: cellheight } } />
						) ) }
					</tr>
				</thead>
			) }
			<tbody>
				{ times( rowCount, ( rowIndex ) => (
					<tr key={ rowIndex }>
						{ times( columnCount, ( columnIndex ) => (
							<td key={ columnIndex } style={ { height: cellheight } } />
						) ) }
					</tr>
				) ) }
			</tbody>
			{ hasFooter && (
				<tfoot>
					<tr>
						{ times( columnCount, ( columnIndex ) => (
							<td key={ columnIndex } style={ { height: cellheight } } />
						) ) }
					</tr>
				</tfoot>
			) }
		</table>
	);
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
