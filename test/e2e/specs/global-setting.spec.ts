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

test.describe( 'Global Setting', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should output inline style reflecting the settings', async ( {
		editor,
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		// Open the global setting.
		await editor.openDocumentSettingsSidebar();
		await page.getByRole( 'button', { name: 'Global setting', exact: true } ).click();
		await page.getByRole( 'button', { name: 'Edit global setting' } ).click();
		// Restore settings.
		await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
		await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
		await expect( page.locator( '.ftb-global-setting-modal__notice' ) ).toContainText(
			'Global setting restored.'
		);
		await page.locator( '.ftb-global-setting-modal__notice' ).getByRole( 'button' ).click();
		// Change table width.
		await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '90' );
		// Change table max width.
		await page.getByRole( 'spinbutton', { name: 'Table max width' } ).fill( '110' );
		await page.getByRole( 'button', { name: 'Separate' } ).click();
		// Change striped colors.
		const tableColors = [
			{ color: '111111', label: 'Striped style background color ( odd rows )' },
			{ color: '222222', label: 'Striped style background color ( even rows )' },
		];
		for ( let i = 0; i < tableColors.length; i++ ) {
			const { color, label } = tableColors[ i ];
			await page
				.getByRole( 'group', { name: label } )
				.getByRole( 'button', { name: 'Color' } )
				.click();
			await pageUtils.pressKeys( 'Enter' );
			await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
			await pageUtils.pressKeys( 'Escape', { times: 2 } );
		}
		// Apply cell styles.
		await page.getByRole( 'tab', { name: 'Cell styles' } ).click();
		// Change cell colors.
		const cellColors = [
			{ color: '333333', selector: 'text-color-th' },
			{ color: '444444', selector: 'text-color-td' },
			{ color: '555555', selector: 'background-color-th' },
			{ color: '666666', selector: 'background-color-td' },
			{ color: '777777', selector: 'border-color' },
		];
		for ( let i = 0; i < cellColors.length; i++ ) {
			await page
				.getByRole( 'dialog', { name: 'Flexible Table Block Global setting' } )
				.getByRole( 'button', { name: 'Color' } )
				.nth( i )
				.click();
			await pageUtils.pressKeys( 'Enter' );
			await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( cellColors[ i ].color );
			await pageUtils.pressKeys( 'Escape', { times: 2 } );
		}
		// Change cell padding.
		await page.getByRole( 'button', { name: 'Unlink sides' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Top' } ).fill( '1' );
		await page.getByRole( 'spinbutton', { name: 'Right' } ).fill( '2' );
		await page.getByRole( 'spinbutton', { name: 'Bottom' } ).fill( '3' );
		await page.getByRole( 'spinbutton', { name: 'Left' } ).fill( '4' );
		// Change cell border width.
		await page.getByRole( 'spinbutton', { name: 'All' } ).fill( '2' );
		// Change cell border style.
		await page.getByRole( 'button', { name: 'Dotted' } ).click();
		// Change cell alignments.
		await page.getByRole( 'button', { name: 'Align center' } ).click();
		await page.getByRole( 'button', { name: 'Align bottom' } ).click();
		// Save settings.
		await page.getByRole( 'button', { name: 'Save settings' } ).click();
		await page.locator( '.ftb-global-setting-modal__notice' );
		await expect( page.locator( '.ftb-global-setting-modal__notice' ) ).toContainText(
			'Global setting saved.'
		);
		const styleTagContent = await page.evaluate( () => {
			const styleTag = document.querySelector( 'style#flexible-table-block-editor-inline-css' );
			return styleTag ? styleTag.textContent : '';
		} );

		expect( styleTagContent ).toBe(
			`.editor-styles-wrapper .wp-block-flexible-table-block-table>table{width:90%;max-width:110%;border-collapse:separate;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) th{background-color:#111111;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) td{background-color:#111111;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) th{background-color:#222222;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) td{background-color:#222222;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th,.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{padding:1em 2em 3em 4em;border-width:2px;border-style:dotted;border-color:#777777;text-align:center;vertical-align:bottom;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th{color:#333333;background-color:#555555;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{color:#444444;background-color:#666666;}`
		);

		// Restore settings.
		await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
		await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
		await expect( page.locator( '.ftb-global-setting-modal__notice' ) ).toContainText(
			'Global setting restored.'
		);
		await page.locator( '.ftb-global-setting-modal__notice ' ).getByRole( 'button' ).click();

		const defaultStyleTagContent = await page.evaluate( () => {
			const styleTag = document.querySelector( 'style#flexible-table-block-editor-inline-css' );
			return styleTag ? styleTag.textContent : '';
		} );

		expect( defaultStyleTagContent ).toBe(
			`.editor-styles-wrapper .wp-block-flexible-table-block-table>table{width:100%;max-width:100%;border-collapse:collapse;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) th{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) td{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) th{background-color:#ffffff;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) td{background-color:#ffffff;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th,.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{padding:0.5em;border-width:1px;border-style:solid;border-color:#000000;text-align:left;vertical-align:middle;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{background-color:#ffffff;}`
		);
	} );
} );
