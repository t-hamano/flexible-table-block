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
