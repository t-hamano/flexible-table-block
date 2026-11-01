/**
 * External dependencies
 */
import type { Properties } from 'csstype';

/**
 * Convert inline CSS styles to object.
 *
 * @param inlineStyles Inline CSS styles.
 * @return CSS styles object.
 */
export function convertToObject( inlineStyles: string | undefined ): Properties {
	if ( ! inlineStyles ) {
		return {};
	}

	return Object.fromEntries(
		inlineStyles
			.split( ';' )
			.map( ( style ) => {
				const separatorIndex = style.indexOf( ':' );
				if ( separatorIndex === -1 ) {
					return [ '', '' ];
				}
				return [
					style.slice( 0, separatorIndex ).trim(),
					style.slice( separatorIndex + 1 ).trim(),
				];
			} )
			.filter( ( [ property, value ] ) => property && value )
			.map( ( [ property, value ] ) => [
				// Keep custom properties as is.
				property.startsWith( '--' )
					? property
					: property.toLowerCase().replace( /-([a-z])/g, ( _, c: string ) => c.toUpperCase() ),
				value,
			] )
	);
}

/**
 * Convert CSS styles object to Inline CSS styles.
 *
 * @param stylesObj CSS styles object.
 * @return Inline CSS styles
 */
export function convertToInline( stylesObj: Properties ): string {
	const lines = Object.keys( stylesObj ).reduce< string[] >( ( result, key ) => {
		const property = key.startsWith( '--' )
			? key
			: key.replace( /[A-Z]/g, ( c ) => `-${ c.toLowerCase() }` );
		const value = stylesObj[ key as keyof Properties ];

		if (
			( typeof value === 'string' && value !== '' ) ||
			( typeof value === 'number' && Number.isFinite( value ) )
		) {
			result.push( `${ property }:${ value };` );
		}
		return result;
	}, [] );

	return lines.join( '' );
}
