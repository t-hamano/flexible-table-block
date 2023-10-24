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

async function applyCellStyles( page ) {
	// Font Size, Line Hiehgt, Width styles.
	await page.fill( 'role=spinbutton[name="Cell font size"i]', '20' );
	await page.fill( 'role=spinbutton[name="Cell line height"i]', '2' );
	await page.fill( 'role=spinbutton[name="Cell width"i]', '100' );

	// Text Color, Background Color styles.
	await page.click(
		'[aria-labelledby="flexible-table-block-cell-text-color-heading"] >> role=button[name="All"i]',
		'All'
	);
	await page.keyboard.press( 'Enter' );
	await page.fill( 'role=textbox[name="Hex color"i]', '111111' );
	await page.keyboard.press( 'Escape' );
	await page.keyboard.press( 'Escape' );
	await page.click(
		'[aria-labelledby="flexible-table-block-cell-background-color-heading"] >> role=button[name="All"i]',
		'All'
	);
	await page.keyboard.press( 'Enter' );
	await page.fill( 'role=textbox[name="Hex color"i]', '333333' );

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
		await page.click(
			`.ftb-${ selector }-control__header-control >> role=button[name="Unlink sides"i]`
		);
		for ( let j = 0; j < labels.length; j++ ) {
			await page.fill(
				`.ftb-${ selector }-control__input-controls >> role=spinbutton[name="${ labels[ j ] }"i]`,
				( j + 1 ).toString()
			);
		}
	}

	// Boder Style styles.
	await page.click(
		'.ftb-border-style-control__button-controls >> role=button[name="Unlink sides"i]'
	);
	await page.click( 'role=button[name="Solid"i] >> nth=0' );
	await page.click( 'role=button[name="Dotted"i] >> nth=1' );
	await page.click( 'role=button[name="Dashed"i] >> nth=2' );
	await page.click( 'role=button[name="Double"i] >> nth=3' );

	// Border Color styles.
	await page.click( '.ftb-border-color-control__controls >> role=button[name="Unlink sides"i]' );
	const colors = [
		{ color: '111111', label: 'Top' },
		{ color: '222222', label: 'Right' },
		{ color: '333333', label: 'Bottom' },
		{ color: '444444', label: 'Left' },
	];
	for ( let i = 0; i < colors.length; i++ ) {
		await page.click(
			`.ftb-border-color-control__controls >> role=button[name="${ colors[ i ].label }"i]`
		);
		await page.keyboard.press( 'Enter' );
		await page.fill( 'role=textbox[name="Hex color"i]', colors[ i ].color );
		await page.keyboard.press( 'Escape' );
		await page.keyboard.press( 'Escape' );
	}

	// Cell Alignment styles.
	await page.click( 'role=button[name="Align center"i]' );
	await page.click( 'role=button[name="Align middle"i]' );

	// Cell Tag element.
	await page.click( 'role=button[name="TH"i]' );

	// Cell CSS class.
	await page.fill( 'role=textbox[name="Cell CSS class(es)"i]', 'custom' );

	// id, headers, scope getBlockAttributes.
	await page.fill( 'role=textbox[name="id attribute"i]', 'id' );
	await page.fill( 'role=textbox[name="headers attribute"i]', 'headers' );
	await page.click( 'role=button[name="row"i]' );
}

test.describe( 'Styles', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'table styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Table settings"i]' );

		// Toggle settings.
		await page.locator( 'role=checkbox[name="Fixed width table cells"i]' ).check();
		await page.locator( 'role=checkbox[name="Scroll on desktop view"i]' ).check();
		await page.locator( 'role=checkbox[name="Scroll on mobile view"i]' ).check();
		await page.locator( 'role=checkbox[name="Stack on mobile"i]' ).check();
		await page.selectOption( 'role=combobox[name="Fixed control"i]', 'Fixed first column' );

		// Width styles.
		await page.fill( 'role=spinbutton[name="Table width"i]', '500' );
		await page.fill( 'role=spinbutton[name="Table max width"i]', '600' );
		await page.fill( 'role=spinbutton[name="Table min width"i]', '400' );

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
			await page.click(
				`.ftb-${ selector }-control__header-control >> role=button[name="Unlink sides"i]`
			);
			for ( let j = 0; j < labels.length; j++ ) {
				await page.fill(
					`.ftb-${ selector }-control__input-controls >> role=spinbutton[name="${ labels[ j ] }"i]`,
					( j + 1 ).toString()
				);
			}
		}

		// Boder Style styles.
		await page.click(
			'.ftb-border-style-control__button-controls >> role=button[name="Unlink sides"i]'
		);
		await page.click( 'role=button[name="Solid"i] >> nth=0' );
		await page.click( 'role=button[name="Dotted"i] >> nth=1' );
		await page.click( 'role=button[name="Dashed"i] >> nth=2' );
		await page.click( 'role=button[name="Double"i] >> nth=3' );

		// Border Color styles.
		await page.click( '.ftb-border-color-control__controls >> role=button[name="Unlink sides"i]' );
		const colors = [
			{ color: '111111', label: 'Top' },
			{ color: '222222', label: 'Right' },
			{ color: '333333', label: 'Bottom' },
			{ color: '444444', label: 'Left' },
		];
		for ( let i = 0; i < colors.length; i++ ) {
			await page.click(
				`.ftb-border-color-control__controls >> role=button[name="${ colors[ i ].label }"i]`
			);
			await page.keyboard.press( 'Enter' );
			await page.fill( 'role=textbox[name="Hex color"i]', colors[ i ].color );
			await page.keyboard.press( 'Escape' );
			await page.keyboard.press( 'Escape' );
		}

		// Border Spacing styles.
		await page.click( 'role=button[name="Separate"i]' );
		await page.click( 'role=button[name="Unlink directions"i]' );
		await page.fill( 'role=spinbutton[name="Horizontal"i]', '10' );
		await page.fill( 'role=spinbutton[name="Vertical"i]', '20' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'cell styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page
			.locator( 'role=rowgroup >> nth=0 >> role=textbox[name="Body cell text"i] >> nth=0' )
			.click();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Cell settings"i]' );
		await applyCellStyles( page );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'cell styles should be applied to multiple cells', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await page.locator( 'role=button[name="Select column"i] >> nth=2' ).click();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Multi cells settings"i]' );
		await applyCellStyles( page );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'caption styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page.locator( 'role=document[name="Block: Flexible Table"i] >> figcaption' ).click();
		await page.keyboard.type( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Caption settings"i]' );
		await page.fill( 'role=spinbutton[name="Caption font size"i]', '20' );
		await page.fill( 'role=spinbutton[name="Caption line height"i]', '2' );
		await page.click( 'role=button[name="Unlink sides"i]' );
		await page.fill( 'role=spinbutton[name="Top"i]', '1' );
		await page.fill( 'role=spinbutton[name="Right"i]', '2' );
		await page.fill( 'role=spinbutton[name="Bottom"i]', '3' );
		await page.fill( 'role=spinbutton[name="Left"i]', '4' );
		await page.click(
			'[aria-labelledby="flexible-table-block-caption-side-heading"] >> role=button[name="Top"i]'
		);
		await page.click( 'role=button[name="Align center"i]' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
