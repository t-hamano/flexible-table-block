import { sanitizeUnitValue } from '../unit-helpers';

describe( 'helper', () => {
	describe( 'sanitizeUnitValue', () => {
		it( 'should not change the correct value', () => {
			expect( sanitizeUnitValue( '10px' ) ).toBe( '10px' );
			expect( sanitizeUnitValue( '10%' ) ).toBe( '10%' );
		} );

		it( 'should remove the unit for zero', () => {
			expect( sanitizeUnitValue( '0px' ) ).toBe( '0' );
			expect( sanitizeUnitValue( '0%' ) ).toBe( '0' );
		} );

		it( 'should return lowercase unit', () => {
			expect( sanitizeUnitValue( '10PX' ) ).toBe( '10px' );
			expect( sanitizeUnitValue( '10CM' ) ).toBe( '10cm' );
		} );

		it( 'should return empty string if it is not a number or minus value', () => {
			expect( sanitizeUnitValue( '' ) ).toBe( '' );
			expect( sanitizeUnitValue( '-10rem' ) ).toBe( '' );
			expect( sanitizeUnitValue( 'red' ) ).toBe( '' );
		} );

		it( 'should return minNum option value if minNum option is set', () => {
			expect( sanitizeUnitValue( '10px', { minNum: 40 } ) ).toBe( '40px' );
			expect( sanitizeUnitValue( '20.11%', { minNum: 40 } ) ).toBe( '40%' );
		} );

		it( 'should return maxNum option value if maxNum option is set', () => {
			expect( sanitizeUnitValue( '40em', { maxNum: 10 } ) ).toBe( '10em' );
			expect( sanitizeUnitValue( '20.11px', { maxNum: 10 } ) ).toBe( '10px' );
		} );

		it( 'should return truncated value', () => {
			expect( sanitizeUnitValue( '10.11111111px' ) ).toBe( '10.1111px' );
		} );

		it( 'should return truncated value if precision option is set', () => {
			expect( sanitizeUnitValue( '10.11111111em', { precision: 6 } ) ).toBe( '10.111111em' );
		} );

		it( 'should return sanitized value if multiple option is set', () => {
			expect( sanitizeUnitValue( '10.11111111CM', { maxNum: 10 } ) ).toBe( '10cm' );
		} );
	} );
} );
