/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
import FlexibleTableBlockUtils from '../util';

test.use( {
	fsbUtils: async ( { page, editor }, use ) => {
		await use( new FlexibleTableBlockUtils( { page, editor } ) );
	},
} );

async function applyCellStyles( page, pageUtils ) {
	// Font Size, Line Hiehgt, Width styles.
	await page.getByRole( 'spinbutton', { name: 'Cell font size' } ).fill( '20' );
	await page.getByRole( 'spinbutton', { name: 'Cell line height' } ).fill( '2' );
	await page.getByRole( 'spinbutton', { name: 'Cell width' } ).fill( '100' );

	// Text Color, Background Color styles.
	await page
		.locator( '[aria-labelledby="flexible-table-block-cell-text-color-heading"]' )
		.getByRole( 'button', { name: 'All' } )
		.click();
	await pageUtils.pressKeys( 'Enter' );
	await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( '111111' );
	await pageUtils.pressKeys( 'Escape', { times: 2 } );
	await page
		.locator( '[aria-labelledby="flexible-table-block-cell-background-color-heading"]' )
		.getByRole( 'button', { name: 'All' } )
		.click();
	await pageUtils.pressKeys( 'Enter' );
	await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( '333333' );

	// Padding, Border Radius, Border Width styles.
	const styles = [
		{
			selector: 'padding',
			labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
		},
		{
			selector: 'border-radius',
			labels: [ 'Top left', 'Top right', 'Bottom right', 'Bottom left' ],
		},
		{
			selector: 'border-width',
			labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
		},
	];
	for ( let i = 0; i < styles.length; i++ ) {
		const { selector, labels } = styles[ i ];
		await page
			.locator( `.ftb-${ selector }-control__header-control` )
			.getByRole( 'button', { name: 'Unlink sides' } )
			.click();
		for ( let j = 0; j < labels.length; j++ ) {
			await page
				.locator( `.ftb-${ selector }-control__input-controls` )
				.getByRole( 'spinbutton', { name: labels[ j ] } )
				.fill( ( j + 1 ).toString() );
		}
	}

	// Boder Style styles.
	await page
		.locator( '.ftb-border-style-control__button-controls' )
		.getByRole( 'button', { name: 'Unlink sides' } )
		.click();
	await page.getByRole( 'button', { name: 'Solid' } ).nth( 0 ).click();
	await page.getByRole( 'button', { name: 'Dotted' } ).nth( 1 ).click();
	await page.getByRole( 'button', { name: 'Dashed' } ).nth( 2 ).click();
	await page.getByRole( 'button', { name: 'Double' } ).nth( 3 ).click();

	// Border Color styles.
	await page
		.locator( '.ftb-border-color-control__controls' )
		.getByRole( 'button', { name: 'Unlink sides' } )
		.click();
	const colors = [
		{ color: '111111', label: 'Top' },
		{ color: '222222', label: 'Right' },
		{ color: '333333', label: 'Bottom' },
		{ color: '444444', label: 'Left' },
	];
	for ( let i = 0; i < colors.length; i++ ) {
		await page
			.locator( '.ftb-border-color-control__controls' )
			.getByRole( 'button', { name: colors[ i ].label } )
			.click();
		await pageUtils.pressKeys( 'Enter' );
		await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( colors[ i ].color );
		await pageUtils.pressKeys( 'Escape', { times: 2 } );
	}
	// Cell Alignment styles.
	await page.getByRole( 'button', { name: 'Align center' } ).click();
	await page.getByRole( 'button', { name: 'Align middle' } ).click();
	// Cell Tag element.
	await page.getByRole( 'button', { name: 'TH', exact: true } ).click();
	// Cell CSS class.
	await page.getByRole( 'textbox', { name: 'Cell CSS class(es)' } ).fill( 'custom' );
	// id, headers, scope getBlockAttributes.
	await page.getByRole( 'textbox', { name: 'id attribute' } ).fill( 'id' );
	await page.getByRole( 'textbox', { name: 'headers attribute' } ).fill( 'headers' );
	await page.getByRole( 'button', { name: 'row', exact: true } ).click();
}

test.describe( 'Styles', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'table styles should be applied', async ( { editor, page, pageUtils, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Table settings' } ).click();

		// Toggle settings.
		await page.getByRole( 'checkbox', { name: 'Fixed width table cells' } ).uncheck();
		await page.getByRole( 'checkbox', { name: 'Scroll on desktop view' } ).check();
		await page.getByRole( 'checkbox', { name: 'Scroll on mobile view' } ).check();
		await page.getByRole( 'checkbox', { name: 'Stack on mobile' } ).check();
		await page
			.getByRole( 'combobox', { name: 'Fixed control' } )
			.selectOption( 'Fixed first column' );

		// Width styles.
		await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '500' );
		// Change table max width.
		await page.getByRole( 'spinbutton', { name: 'Table max width' } ).fill( '600' );
		await page.getByRole( 'spinbutton', { name: 'Table min width' } ).fill( '400' );
		// Padding, Border Radius, Border Width styles.
		const styles = [
			{
				selector: 'padding',
				labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
			},
			{
				selector: 'border-radius',
				labels: [ 'Top left', 'Top right', 'Bottom right', 'Bottom left' ],
			},
			{
				selector: 'border-width',
				labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
			},
		];
		for ( let i = 0; i < styles.length; i++ ) {
			const { selector, labels } = styles[ i ];
			await page
				.locator( `.ftb-${ selector }-control__header-control` )
				.getByRole( 'button', { name: 'Unlink sides' } )
				.click();
			for ( let j = 0; j < labels.length; j++ ) {
				await page
					.locator( `.ftb-${ selector }-control__input-controls` )
					.getByRole( 'spinbutton', { name: labels[ j ] } )
					.fill( ( j + 1 ).toString() );
			}
		}

		// Boder Style styles.
		await page
			.locator( '.ftb-border-style-control__button-controls' )
			.getByRole( 'button', { name: 'Unlink sides' } )
			.click();
		await page.getByRole( 'button', { name: 'Solid' } ).nth( 0 ).click();
		await page.getByRole( 'button', { name: 'Dotted' } ).nth( 1 ).click();
		await page.getByRole( 'button', { name: 'Dashed' } ).nth( 2 ).click();
		await page.getByRole( 'button', { name: 'Double' } ).nth( 3 ).click();

		// Border Color styles.
		await page
			.locator( '.ftb-border-color-control__controls' )
			.getByRole( 'button', { name: 'Unlink sides' } )
			.click();
		const colors = [
			{ color: '111111', label: 'Top' },
			{ color: '222222', label: 'Right' },
			{ color: '333333', label: 'Bottom' },
			{ color: '444444', label: 'Left' },
		];
		for ( let i = 0; i < colors.length; i++ ) {
			await page
				.locator( '.ftb-border-color-control__controls' )
				.getByRole( 'button', { name: colors[ i ].label } )
				.click();
			await pageUtils.pressKeys( 'Enter' );
			await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( colors[ i ].color );
			await pageUtils.pressKeys( 'Escape', { times: 2 } );
		}

		// Border Spacing styles.
		await page.getByRole( 'button', { name: 'Separate' } ).click();
		await page.getByRole( 'button', { name: 'Unlink directions' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Horizontal' } ).fill( '10' );
		await page.getByRole( 'spinbutton', { name: 'Vertical' } ).fill( '20' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'cell styles should be applied', async ( { editor, page, pageUtils, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Cell settings' } ).click();
		await applyCellStyles( page, pageUtils );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'cell styles should be applied to multiple cells', async ( {
		editor,
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await page.getByRole( 'button', { name: 'Select column' } ).nth( 2 ).click();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Multi cells settings' } ).click();
		await applyCellStyles( page, pageUtils );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'caption styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page
			.getByRole( 'textbox', { name: 'Table caption text' } )
			.fill( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Caption settings' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Caption font size' } ).fill( '20' );
		await page.getByRole( 'spinbutton', { name: 'Caption line height' } ).fill( '2' );
		await page.getByRole( 'button', { name: 'Unlink sides' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Top' } ).fill( '1' );
		await page.getByRole( 'spinbutton', { name: 'Right' } ).fill( '2' );
		await page.getByRole( 'spinbutton', { name: 'Bottom' } ).fill( '3' );
		await page.getByRole( 'spinbutton', { name: 'Left' } ).fill( '4' );
		await page
			.locator( '[aria-labelledby="flexible-table-block-caption-side-heading"]' )
			.getByRole( 'button', { name: 'Top' } )
			.click();
		await page.getByRole( 'button', { name: 'Align center' } ).click();
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
