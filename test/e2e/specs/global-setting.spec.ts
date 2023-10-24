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
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=button[name="Global setting"i]' );

		// Restore settings.
		await page.click( 'role=button[name="Restore default settings"i]' );
		await page.click( 'role=button[name="Restore"i]' );
		await expect( page.locator( '.ftb-global-setting-modal__notice' ) ).toContainText(
			'Global setting restored.'
		);
		await page.click( '.ftb-global-setting-modal__notice >> role=button' );

		// Apply table styles.
		await page.fill( 'role=spinbutton[name="Table width"i]', '90' );
		await page.fill( 'role=spinbutton[name="Table max width"i]', '110' );
		await page.click( 'role=button[name="Separate"i]' );

		const tableColors = [
			{ color: '111111', selector: 'odd' },
			{ color: '222222', selector: 'even' },
		];

		for ( let i = 0; i < tableColors.length; i++ ) {
			await page.click( `role=dialog >> role=button[name="All"i] >> nth=${ i }` );
			await page.keyboard.press( 'Enter' );
			await page.fill( 'role=textbox[name="Hex color"i]', tableColors[ i ].color );
			await page.keyboard.press( 'Escape' );
			await page.keyboard.press( 'Escape' );
		}

		// Apply cell styles.
		await page.click( 'role=tab[name="Cell styles"i]' );
		const cellColors = [
			{ color: '333333', selector: 'text-color-th' },
			{ color: '444444', selector: 'text-color-td' },
			{ color: '555555', selector: 'background-color-th' },
			{ color: '666666', selector: 'background-color-td' },
			{ color: '777777', selector: 'border-color' },
		];
		for ( let i = 0; i < cellColors.length; i++ ) {
			await page.click( `role=dialog >> role=button[name="All"i] >> nth=${ i }` );
			await page.keyboard.press( 'Enter' );
			await page.fill( 'role=textbox[name="Hex color"i]', cellColors[ i ].color );
			await page.keyboard.press( 'Escape' );
			await page.keyboard.press( 'Escape' );
		}
		await page.click( 'role=button[name="Unlink sides"i]' );
		await page.fill( 'role=spinbutton[name="Top"i]', '1' );
		await page.fill( 'role=spinbutton[name="Right"i]', '2' );
		await page.fill( 'role=spinbutton[name="Bottom"i]', '3' );
		await page.fill( 'role=spinbutton[name="Left"i]', '4' );
		await page.fill(
			'.ftb-border-width-control__header-control >> role=spinbutton[name="All"i]',
			'2'
		);
		await page.click( 'role=button[name="Dotted"i]' );
		await page.click( 'role=button[name="Align center"i]' );
		await page.click( 'role=button[name="Align bottom"i]' );

		// Save settings.
		await page.click( 'role=button[name="Save settings"i]' );
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
		await page.click( 'role=button[name="Restore default settings"i]' );
		await page.click( 'role=button[name="Restore"i]' );
		await expect( page.locator( '.ftb-global-setting-modal__notice' ) ).toContainText(
			'Global setting restored.'
		);
		await page.click( '.ftb-global-setting-modal__notice >> role=button' );

		const defaultStyleTagContent = await page.evaluate( () => {
			const styleTag = document.querySelector( 'style#flexible-table-block-editor-inline-css' );
			return styleTag ? styleTag.textContent : '';
		} );

		expect( defaultStyleTagContent ).toBe(
			`.editor-styles-wrapper .wp-block-flexible-table-block-table>table{width:100%;max-width:100%;border-collapse:collapse;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) th{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) td{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) th{background-color:#ffffff;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) td{background-color:#ffffff;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th,.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{padding:0.5em;border-width:1px;border-style:solid;border-color:#000000;text-align:left;vertical-align:middle;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{background-color:#ffffff;}`
		);
	} );
} );
