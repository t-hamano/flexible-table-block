/**
 * Convert inline css styles to object.
 *
 * @param {string} inlineStyles Inline CSS styles.
 * @return {Object} CSS styles object.
 */
export function convertToObject( inlineStyles ) {
	if ( ! inlineStyles || typeof inlineStyles !== 'string' ) {
		return {};
	}

	return inlineStyles
		.split( ';' )
		.filter( ( style ) => style.split( ':' )[ 0 ] && style.split( ':' )[ 1 ] )
		.map( ( style ) => [
			style
				.split( ':' )[ 0 ]
				.trim()
				.replace( /-./g, ( c ) => c.substr( 1 ).toUpperCase() ),
			style.split( ':' )[ 1 ].trim(),
		] )
		.reduce(
			( styleObj, style ) => ( {
				...styleObj,
				[ style[ 0 ] ]: style[ 1 ],
			} ),
			{}
		);
}

/**
 * Convert CSS styles object to Inline CSS styles.
 *
 * @param {Object} stylesObj CSS styles object.
 * @return {string} Inline CSS styles
 */
export function convertToInline( stylesObj ) {
	if ( ! stylesObj || typeof stylesObj !== 'object' ) {
		return '';
	}

	const lines = Object.keys( stylesObj ).reduce( function ( result, key ) {
		const property = key.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
		const value = stylesObj[ key ];
		if ( value ) {
			result.push( `${ property }:${ value };` );
		}
		return result;
	}, [] );

	return lines.join( '' );
}
