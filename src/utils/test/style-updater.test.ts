import {
	updateBorderColor,
	updateBorderRadius,
	updateBorderSpacing,
	updateBorderStyle,
	updateBorderWidth,
	updatePadding,
} from '../style-updater';

describe( 'style-updater', () => {
	describe( 'updatePadding', () => {
		it( 'should remove padding props', () => {
			expect(
				updatePadding(
					{
						padding: '15px',
						color: 'red',
					},
					{}
				)
			).toStrictEqual( { color: 'red' } );
		} );

		it( 'should return a long hand', () => {
			expect(
				updatePadding(
					{},
					{
						top: '20px',
					}
				)
			).toStrictEqual( {
				paddingTop: '20px',
			} );
		} );

		it( 'should return a short hand', () => {
			expect(
				updatePadding(
					{},
					{
						top: '20px',
						right: '20px',
						left: '20px',
						bottom: '20px',
					}
				)
			).toStrictEqual( {
				padding: '20px',
			} );
		} );

		it( 'should return a short hand 2value', () => {
			expect(
				updatePadding(
					{},
					{
						top: '20px',
						right: '30px',
						left: '30px',
						bottom: '20px',
					}
				)
			).toStrictEqual( {
				padding: '20px 30px',
			} );
		} );
	} );

	describe( 'updateBorderWidth', () => {
		it( 'should remove padding props', () => {
			expect(
				updateBorderWidth(
					{
						borderWidth: '15px',
						color: 'red',
					},
					{}
				)
			).toStrictEqual( { color: 'red' } );
		} );

		it( 'should return a long hand', () => {
			expect(
				updateBorderWidth(
					{},
					{
						top: '20px',
					}
				)
			).toStrictEqual( {
				borderTopWidth: '20px',
			} );
		} );

		it( 'should return a short hand', () => {
			expect(
				updateBorderWidth(
					{},
					{
						top: '20px',
						right: '20px',
						bottom: '20px',
						left: '20px',
					}
				)
			).toStrictEqual( {
				borderWidth: '20px',
			} );
		} );

		it( 'should return a short hand 2value', () => {
			expect(
				updateBorderWidth(
					{},
					{
						top: '20px',
						right: '30px',
						bottom: '20px',
						left: '30px',
					}
				)
			).toStrictEqual( {
				borderWidth: '20px 30px',
			} );
		} );
	} );

	describe( 'updateBorderColor', () => {
		it( 'should remove padding props', () => {
			expect(
				updateBorderColor(
					{
						borderColor: 'red',
						color: 'red',
					},
					{}
				)
			).toStrictEqual( { color: 'red' } );
		} );

		it( 'should return a long hand', () => {
			expect(
				updateBorderColor(
					{},
					{
						top: 'red',
					}
				)
			).toStrictEqual( {
				borderTopColor: 'red',
			} );
		} );

		it( 'should return a short hand', () => {
			expect(
				updateBorderColor(
					{},
					{
						top: 'red',
						right: 'red',
						left: 'red',
						bottom: 'red',
					}
				)
			).toStrictEqual( {
				borderColor: 'red',
			} );
		} );

		it( 'should return a short hand 2value', () => {
			expect(
				updateBorderColor(
					{},
					{
						top: 'red',
						right: 'dotted',
						left: 'dotted',
						bottom: 'red',
					}
				)
			).toStrictEqual( {
				borderColor: 'red dotted',
			} );
		} );
	} );

	describe( 'updateBorderStyle', () => {
		it( 'should remove borderStyle props', () => {
			expect(
				updateBorderStyle(
					{
						borderStyle: 'solid',
						color: 'red',
					},
					{}
				)
			).toStrictEqual( { color: 'red' } );
		} );

		it( 'should return a long hand', () => {
			expect(
				updateBorderStyle(
					{},
					{
						top: 'solid',
					}
				)
			).toStrictEqual( {
				borderTopStyle: 'solid',
			} );
		} );

		it( 'should return a short hand', () => {
			expect(
				updateBorderStyle(
					{},
					{
						top: 'solid',
						right: 'solid',
						left: 'solid',
						bottom: 'solid',
					}
				)
			).toStrictEqual( {
				borderStyle: 'solid',
			} );
		} );

		it( 'should return a short hand 2value', () => {
			expect(
				updateBorderStyle(
					{},
					{
						top: 'solid',
						right: 'dotted',
						left: 'dotted',
						bottom: 'solid',
					}
				)
			).toStrictEqual( {
				borderStyle: 'solid dotted',
			} );
		} );
	} );

	describe( 'updateBorderSpacing', () => {
		it( 'should remove borderSpacing props', () => {
			expect(
				updateBorderSpacing(
					{
						borderSpacing: '10px',
						color: 'red',
					},
					{}
				)
			).toStrictEqual( { color: 'red' } );
		} );

		it( 'should return one value', () => {
			expect(
				updateBorderSpacing(
					{},
					{
						vertical: '10px',
						horizontal: '10px',
					}
				)
			).toStrictEqual( {
				borderSpacing: '10px',
			} );
		} );

		it( 'should return two values', () => {
			expect(
				updateBorderSpacing(
					{},
					{
						vertical: '20px',
						horizontal: '10px',
					}
				)
			).toStrictEqual( {
				borderSpacing: '10px 20px',
			} );
		} );
	} );

	describe( 'updateBorderRadius', () => {
		it( 'should remove borderRadius props', () => {
			expect(
				updateBorderRadius(
					{
						borderRadius: '15px',
						color: 'red',
					},
					{}
				)
			).toStrictEqual( { color: 'red' } );
		} );

		it( 'should return a long hand', () => {
			expect(
				updateBorderRadius(
					{},
					{
						topLeft: '20px',
					}
				)
			).toStrictEqual( {
				borderTopLeftRadius: '20px',
			} );
		} );

		it( 'should return a short hand', () => {
			expect(
				updateBorderRadius(
					{},
					{
						topLeft: '20px',
						topRight: '20px',
						bottomRight: '20px',
						bottomLeft: '20px',
					}
				)
			).toStrictEqual( {
				borderRadius: '20px',
			} );
		} );

		it( 'should return a short hand 2value', () => {
			expect(
				updateBorderRadius(
					{},
					{
						topLeft: '20px',
						topRight: '30px',
						bottomRight: '20px',
						bottomLeft: '30px',
					}
				)
			).toStrictEqual( {
				borderRadius: '20px 30px',
			} );
		} );

		it( 'should return a short hand 3value', () => {
			expect(
				updateBorderRadius(
					{},
					{
						topLeft: '2px',
						topRight: '4px',
						bottomRight: '3px',
						bottomLeft: '4px',
					}
				)
			).toStrictEqual( {
				borderRadius: '2px 4px 3px',
			} );
		} );
	} );
} );
