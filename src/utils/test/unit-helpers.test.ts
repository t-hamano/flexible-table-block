import { toUnitVal, parseUnit } from '../unit-helpers';

describe( 'helper', () => {
	describe( 'toUnitVal', () => {
		it( 'should not change the correct value.', () => {
			expect( toUnitVal( '10px' ) ).toBe( '10px' );
			expect( toUnitVal( '10%' ) ).toBe( '10%' );
		} );

		it( 'should remove the unit for zero.', () => {
			expect( toUnitVal( '0px' ) ).toBe( '0' );
			expect( toUnitVal( '0%' ) ).toBe( '0' );
		} );
	} );

	describe( 'parseUnit', () => {
		it( 'should return taple', () => {
			expect( parseUnit( '10px' ) ).toStrictEqual( [ 10, 'px' ] );
			expect( parseUnit( '10%' ) ).toStrictEqual( [ 10, '%' ] );
		} );

		it( 'should return lowercase unit', () => {
			expect( parseUnit( '10PX' ) ).toStrictEqual( [ 10, 'px' ] );
			expect( parseUnit( '10CM' ) ).toStrictEqual( [ 10, 'cm' ] );
		} );

		it( 'should return zero if it is not a number.', () => {
			expect( parseUnit( 'red' ) ).toStrictEqual( [ 0, '' ] );
		} );
	} );
} );
