/**
 * External dependencies
 */
import type { Properties } from 'csstype';

/**
 * Split inline CSS styles into declarations, ignoring semicolons inside
 * brackets (e.g. `url()`), quotes, comments, or escaped with a backslash.
 * Comments before the property name are removed, and comments in the value
 * are kept as is so that saved markup round-trips. Inside parentheses,
 * only nested parentheses and quotes are tracked, so that the raw contents
 * of `url()` are kept as is.
 *
 * @param inlineStyles Inline CSS styles.
 * @return CSS declarations.
 */
function splitDeclarations( inlineStyles: string ): string[] {
	const declarations: string[] = [];
	let current = '';
	let parenDepth = 0;
	let blockDepth = 0;
	let hasColon = false;
	let quote: string | null = null;

	for ( let i = 0; i < inlineStyles.length; i++ ) {
		const char = inlineStyles[ i ];

		if ( char === '\\' ) {
			current += inlineStyles.slice( i, i + 2 );
			i++;
			continue;
		}
		if ( quote ) {
			if ( char === quote ) {
				quote = null;
			}
		} else if ( char === '"' || char === "'" ) {
			quote = char;
		} else if ( char === '(' ) {
			parenDepth++;
		} else if ( char === ')' ) {
			parenDepth = Math.max( 0, parenDepth - 1 );
		} else if ( parenDepth > 0 ) {
			// Inside parentheses, other characters have no special meaning.
		} else if ( char === '/' && inlineStyles[ i + 1 ] === '*' ) {
			const commentEnd = inlineStyles.indexOf( '*/', i + 2 );
			const end = commentEnd === -1 ? inlineStyles.length : commentEnd + 2;
			if ( hasColon ) {
				current += inlineStyles.slice( i, end );
			}
			i = end - 1;
			continue;
		} else if ( char === ':' ) {
			hasColon = true;
		} else if ( char === '{' || char === '[' ) {
			blockDepth++;
		} else if ( char === '}' || char === ']' ) {
			blockDepth = Math.max( 0, blockDepth - 1 );
		} else if ( char === ';' && blockDepth === 0 ) {
			declarations.push( current );
			current = '';
			hasColon = false;
			continue;
		}
		current += char;
	}
	declarations.push( current );

	return declarations;
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
		// Keep custom properties as is, and convert `-ms-` prefix to lowercase `ms` following React's convention.
		const key = property.startsWith( '--' )
			? property
			: property
					.toLowerCase()
					.replace( /^-ms-/, 'ms-' )
					.replace( /-([a-z])/g, ( _, c: string ) => c.toUpperCase() );
		return [ [ key, value ] ];
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
	const lines = Object.keys( stylesObj ).reduce< string[] >( ( result, key ) => {
		const property = key.startsWith( '--' )
			? key
			: key.replace( /^ms(?=[A-Z])/, '-ms' ).replace( /[A-Z]/g, ( c ) => `-${ c.toLowerCase() }` );
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
