/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import { convertToInline, convertToObject } from '../style-converter';

describe( 'style-converter', () => {
	describe( 'convertToObject', () => {
		it( 'should convert inline style to object', () => {
			expect(
				convertToObject( `
				background: red;
				border-radius: 10px;
				border-right: 1px solid blue;
			` )
			).toStrictEqual( {
				background: 'red',
				borderRadius: '10px',
				borderRight: '1px solid blue',
			} );
		} );

		it( 'should return an empty object for empty or undefined input', () => {
			expect( convertToObject( '' ) ).toStrictEqual( {} );
			expect( convertToObject( undefined ) ).toStrictEqual( {} );
		} );

		it( 'should ignore declarations without property or value', () => {
			expect( convertToObject( 'color:;:red;width;;height:10px' ) ).toStrictEqual( {
				height: '10px',
			} );
		} );

		it( 'should split each declaration on the first colon only', () => {
			expect( convertToObject( 'background-image:url(https://example.com/a.png)' ) ).toStrictEqual(
				{
					backgroundImage: 'url(https://example.com/a.png)',
				}
			);
		} );

		it( 'should keep custom properties intact', () => {
			expect( convertToObject( '--my-color:red' ) ).toStrictEqual( {
				'--my-color': 'red',
			} );
		} );

		it( 'should convert vendor prefixes', () => {
			expect( convertToObject( '-webkit-box-shadow:none;-ms-transform:none' ) ).toStrictEqual( {
				WebkitBoxShadow: 'none',
				msTransform: 'none',
			} );
		} );
	} );

	describe( 'convertToInline', () => {
		it( 'should convert object to inline', () => {
			expect(
				convertToInline( {
					background: 'red',
					borderRadius: '10px',
					borderRight: '1px solid blue',
				} )
			).toBe( 'background:red;border-radius:10px;border-right:1px solid blue;' );
		} );

		it( 'should return an empty string for an empty object', () => {
			expect( convertToInline( {} ) ).toBe( '' );
		} );

		it( 'should keep numeric values', () => {
			expect( convertToInline( { opacity: 0.5, zIndex: 2, flexGrow: 0 } ) ).toBe(
				'opacity:0.5;z-index:2;flex-grow:0;'
			);
		} );

		it( 'should skip undefined and empty values', () => {
			expect( convertToInline( { color: undefined, width: '', height: '10px' } ) ).toBe(
				'height:10px;'
			);
		} );

		it( 'should keep custom properties and vendor prefixes intact', () => {
			expect(
				convertToInline( {
					'--my-color': 'red',
					WebkitBoxShadow: 'none',
					msTransform: 'none',
				} as Parameters< typeof convertToInline >[ 0 ] )
			).toBe( '--my-color:red;-webkit-box-shadow:none;-ms-transform:none;' );
		} );
	} );

	describe( 'round-trip', () => {
		it.each( [
			'background-image:url(https://example.com/a.png);',
			'--my-color:red;',
			'-webkit-box-shadow:none;',
			'-ms-transform:none;',
			'border-top-left-radius:4px;color:red;',
		] )( 'should preserve %s', ( inline ) => {
			expect( convertToInline( convertToObject( inline ) ) ).toBe( inline );
		} );
	} );
} );
