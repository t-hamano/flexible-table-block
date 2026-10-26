/**
 * Internal dependencies
 */
import metadata from './block.json';
import save from './save';

/**
 * Remove the `role` key from attribute definitions, including nested query attributes.
 *
 * @param value Attribute definitions.
 * @return Attribute definitions without `role`.
 */
function omitRole( value: unknown ): unknown {
	if ( Array.isArray( value ) ) {
		return value.map( omitRole );
	}
	if ( value && typeof value === 'object' ) {
		return Object.fromEntries(
			Object.entries( value )
				.filter( ( [ key ] ) => key !== 'role' )
				.map( ( [ key, childValue ] ) => [ key, omitRole( childValue ) ] )
		);
	}
	return value;
}

// To fix a problem with link colors not being applied
const v1 = {
	// Same as the current attributes, but without `role: "content"`.
	attributes: omitRole( metadata.attributes ),
	supports: {
		anchor: true,
		align: [ 'left', 'right', 'wide', 'full' ],
		color: {
			__experimentalSkipSerialization: true,
			gradients: true,
			link: true,
		},
		typography: {
			fontSize: true,
			lineHeight: true,
			__experimentalFontFamily: true,
			__experimentalTextTransform: true,
			__experimentalFontStyle: true,
			__experimentalFontWeight: true,
			__experimentalLetterSpacing: true,
		},
		spacing: {
			margin: true,
		},
		__experimentalSelector: '.wp-block-flexible-table-block-table > table',
	},
	save,
};

export default [ v1 ];
