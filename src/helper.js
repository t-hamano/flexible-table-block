/**
 * Gets styles for table.
 *
 * @param {Object} attributes Table attributes.
 *
 * @return {Object} Table style.
 */
export function getTableStyle( attributes ) {
	const { borderCollapse } = attributes;
	const borderSpacingHorizontal = 0 > parseFloat( attributes.borderSpacingHorizontal ) ? '0' : attributes.borderSpacingHorizontal;
	const borderSpacingVertical = 0 > parseFloat( attributes.borderSpacingVertical ) ? '0' : attributes.borderSpacingVertical;

	if ( ( 'collapse' === borderCollapse ) || ( '0' === borderSpacingHorizontal && '0' === borderSpacingVertical ) ) {
		return {};
	} else if ( borderSpacingHorizontal === borderSpacingVertical ) {
		return {
			borderCollapse: 'separate',
			borderSpacing: borderSpacingHorizontal
		};
	} else {
		return {
			borderCollapse: 'separate',
			borderSpacing: `${borderSpacingHorizontal} ${borderSpacingVertical}`
		};
	}
}
