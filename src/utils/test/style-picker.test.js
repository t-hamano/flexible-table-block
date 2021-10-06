import { pickPadding } from '../style-picker';

describe( 'style-picker', () => {
	it( 'should separate shorthand prop', () => {
		expect( pickPadding( { padding: '10px' } ) ).toStrictEqual( {
			bottom: '10px',
			left: '10px',
			right: '10px',
			top: '10px',
		} );
	} );
} );
