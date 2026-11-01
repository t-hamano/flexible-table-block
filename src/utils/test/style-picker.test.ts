/**
 * External dependencies
 */
import { describe, it, expect } from 'vitest';

/**
 * Internal dependencies
 */
import {
	pickBorderSpacing,
	pickFourSides,
	BORDER_COLOR_STYLE,
	BORDER_RADIUS_STYLE,
	BORDER_WIDTH_STYLE,
	PADDING_STYLE,
} from '../style-picker';

describe( 'style-picker', () => {
	describe( 'pickFourSides (padding)', () => {
		it( 'should separate shorthand prop', () => {
			expect( pickFourSides( { padding: '10px' }, PADDING_STYLE ) ).toStrictEqual( {
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
			} );
		} );

		it( 'should separate vertical and horizontal', () => {
			expect( pickFourSides( { padding: '30px 10px' }, PADDING_STYLE ) ).toStrictEqual( {
				top: '30px',
				right: '10px',
				bottom: '30px',
				left: '10px',
			} );
		} );

		it( 'should split vertical and horizontal and side', () => {
			expect( pickFourSides( { padding: '30px 10px 20px' }, PADDING_STYLE ) ).toStrictEqual( {
				top: '30px',
				right: '10px',
				bottom: '20px',
				left: '10px',
			} );
		} );

		it( 'should split four direction', () => {
			expect( pickFourSides( { padding: '30px 10px 20px 40px' }, PADDING_STYLE ) ).toStrictEqual( {
				top: '30px',
				right: '10px',
				bottom: '20px',
				left: '40px',
			} );
		} );
	} );

	describe( 'pickFourSides (border-width)', () => {
		it( 'should separate shorthand prop', () => {
			expect( pickFourSides( { borderWidth: '10px' }, BORDER_WIDTH_STYLE ) ).toStrictEqual( {
				bottom: '10px',
				left: '10px',
				right: '10px',
				top: '10px',
			} );
		} );

		it( 'should separate vertical and horizontal', () => {
			expect( pickFourSides( { borderWidth: '30px 10px' }, BORDER_WIDTH_STYLE ) ).toStrictEqual( {
				top: '30px',
				right: '10px',
				bottom: '30px',
				left: '10px',
			} );
		} );

		it( 'should split vertical and horizontal and side', () => {
			expect(
				pickFourSides( { borderWidth: '30px 10px 20px' }, BORDER_WIDTH_STYLE )
			).toStrictEqual( {
				top: '30px',
				right: '10px',
				bottom: '20px',
				left: '10px',
			} );
		} );

		it( 'should split four direction', () => {
			expect(
				pickFourSides( { borderWidth: '30px 10px 20px 40px' }, BORDER_WIDTH_STYLE )
			).toStrictEqual( {
				top: '30px',
				right: '10px',
				bottom: '20px',
				left: '40px',
			} );
		} );
	} );

	describe( 'pickFourSides (border-color)', () => {
		it( 'should separate shorthand prop', () => {
			expect( pickFourSides( { borderColor: 'red' }, BORDER_COLOR_STYLE ) ).toStrictEqual( {
				top: 'red',
				right: 'red',
				bottom: 'red',
				left: 'red',
			} );
		} );

		it( 'should separate vertical and horizontal', () => {
			expect( pickFourSides( { borderColor: 'red #f015ca' }, BORDER_COLOR_STYLE ) ).toStrictEqual( {
				top: 'red',
				right: '#f015ca',
				bottom: 'red',
				left: '#f015ca',
			} );
		} );

		it( 'should split vertical and horizontal and side', () => {
			expect(
				pickFourSides(
					{
						borderColor: 'red rgb(240,30,50,.7) green',
					},
					BORDER_COLOR_STYLE
				)
			).toStrictEqual( {
				top: 'red',
				right: 'rgb(240,30,50,.7)',
				bottom: 'green',
				left: 'rgb(240,30,50,.7)',
			} );
		} );

		it( 'should split four direction', () => {
			expect(
				pickFourSides( { borderColor: 'red yellow green blue' }, BORDER_COLOR_STYLE )
			).toStrictEqual( {
				top: 'red',
				right: 'yellow',
				bottom: 'green',
				left: 'blue',
			} );
		} );
	} );

	describe( 'pickFourSides (border-radius)', () => {
		it( 'should separate shorthand prop', () => {
			expect( pickFourSides( { borderRadius: '10px' }, BORDER_RADIUS_STYLE ) ).toStrictEqual( {
				topLeft: '10px',
				topRight: '10px',
				bottomRight: '10px',
				bottomLeft: '10px',
			} );
		} );

		it( 'should separate two value', () => {
			expect( pickFourSides( { borderRadius: '10px 5%' }, BORDER_RADIUS_STYLE ) ).toStrictEqual( {
				topLeft: '10px',
				topRight: '5%',
				bottomRight: '10px',
				bottomLeft: '5%',
			} );
		} );

		it( 'should split three value', () => {
			expect( pickFourSides( { borderRadius: '2px 4px 2px' }, BORDER_RADIUS_STYLE ) ).toStrictEqual(
				{
					topLeft: '2px',
					topRight: '4px',
					bottomRight: '2px',
					bottomLeft: '4px',
				}
			);
		} );

		it( 'should split four value', () => {
			expect(
				pickFourSides( { borderRadius: '1px 0 3px 4px' }, BORDER_RADIUS_STYLE )
			).toStrictEqual( {
				topLeft: '1px',
				topRight: '0',
				bottomRight: '3px',
				bottomLeft: '4px',
			} );
		} );
	} );

	describe( 'pickBorderSpacing', () => {
		it( 'should split value', () => {
			expect( pickBorderSpacing( { borderSpacing: '2px' } ) ).toStrictEqual( {
				vertical: '2px',
				horizontal: '2px',
			} );
		} );

		it( 'should parsed correctly', () => {
			expect( pickBorderSpacing( { borderSpacing: '1rem 2em' } ) ).toStrictEqual( {
				vertical: '2em',
				horizontal: '1rem',
			} );
		} );
	} );
} );
