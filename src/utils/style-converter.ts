/**
 * External dependencies
 */
import type { Properties } from 'csstype';

/**
 * Split inline CSS styles into declarations, ignoring semicolons inside
 * parentheses (e.g. `url()`) or quotes.
 *
 * @param inlineStyles Inline CSS styles.
 * @return CSS declarations.
 */
function splitDeclarations( inlineStyles: string ): string[] {
	const declarations: string[] = [];
	let current = '';
	let depth = 0;
	let quote: string | null = null;

	for ( const char of inlineStyles ) {
		if ( quote ) {
			if ( char === quote ) {
				quote = null;
			}
		} else if ( char === '"' || char === "'" ) {
			quote = char;
		} else if ( char === '(' ) {
			depth++;
		} else if ( char === ')' ) {
			depth = Math.max( 0, depth - 1 );
		} else if ( char === ';' && depth === 0 ) {
			declarations.push( current );
			current = '';
			continue;
		}
		current += char;
	}
	declarations.push( current );

	return declarations;
}

/**
 * Convert a CSS property name to a style object key.
 *
 * @param property CSS property name (e.g. `border-radius`, `-webkit-box-shadow`, `--my-color`).
 * @return Style object key (e.g. `borderRadius`, `WebkitBoxShadow`, `--my-color`).
 */
function toObjectKey( property: string ): string {
	if ( property.startsWith( '--' ) ) {
		return property;
	}
	// `-ms-` prefix is converted to lowercase `ms`, following React's convention.
	return property
		.toLowerCase()
		.replace( /^-ms-/, 'ms-' )
		.replace( /-([a-z])/g, ( _, c: string ) => c.toUpperCase() );
}

/**
 * Convert a style object key to a CSS property name.
 *
 * @param key Style object key (e.g. `borderRadius`, `WebkitBoxShadow`, `--my-color`).
 * @return CSS property name (e.g. `border-radius`, `-webkit-box-shadow`, `--my-color`).
 */
function toCssProperty( key: string ): string {
	if ( key.startsWith( '--' ) ) {
		return key;
	}
	return key.replace( /^ms(?=[A-Z])/, '-ms' ).replace( /[A-Z]/g, ( c ) => `-${ c.toLowerCase() }` );
}

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

	const entries = splitDeclarations( inlineStyles ).flatMap( ( declaration ) => {
		const separatorIndex = declaration.indexOf( ':' );
		if ( separatorIndex === -1 ) {
			return [];
		}
		const property = declaration.slice( 0, separatorIndex ).trim();
		const value = declaration.slice( separatorIndex + 1 ).trim();
		if ( ! property || ! value ) {
			return [];
		}
		return [ [ toObjectKey( property ), value ] ];
	} );

	return Object.fromEntries( entries );
}

/**
 * Convert CSS styles object to Inline CSS styles.
 *
 * @param stylesObj CSS styles object.
 * @return Inline CSS styles
 */
export function convertToInline( stylesObj: Properties ): string {
	return Object.entries( stylesObj )
		.filter(
			( [ , value ] ) =>
				( typeof value === 'string' && value !== '' ) ||
				( typeof value === 'number' && Number.isFinite( value ) )
		)
		.map( ( [ key, value ] ) => `${ toCssProperty( key ) }:${ value };` )
		.join( '' );
}
