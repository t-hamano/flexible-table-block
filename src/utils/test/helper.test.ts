import { parseCssValue } from '../helper';

describe( 'helper', () => {
	describe( 'parseCssValue', () => {
		it( 'should return array with four values', () => {
			expect( parseCssValue( '' ) ).toStrictEqual( [ '', '', '', '' ] );
			expect( parseCssValue( '10px' ) ).toStrictEqual( [ '10px', '10px', '10px', '10px' ] );
			expect( parseCssValue( '10px 20em' ) ).toStrictEqual( [ '10px', '20em', '10px', '20em' ] );
			expect( parseCssValue( '10px 20em 30.11%' ) ).toStrictEqual( [
				'10px',
				'20em',
				'30.11%',
				'20em',
			] );
			expect( parseCssValue( '10px 20em 30.11% 40CM' ) ).toStrictEqual( [
				'10px',
				'20em',
				'30.11%',
				'40cm',
			] );
		} );
	} );
} );
