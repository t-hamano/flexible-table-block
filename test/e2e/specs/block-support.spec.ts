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

test.describe( 'Block Support', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'typography settings should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Styles"i]' );

		await page.click( 'role=button[name="Typography options"i]' );
		for ( let i = 0; i < 6; i++ ) {
			await page.click(
				`[aria-label="Typography options"] >> role=menuitemcheckbox >> nth=${ i }`
			);
		}
		await page.click( 'role=button[name="Typography options"i]' );

		await page.selectOption( 'role=combobox[name="Font"i]', 'Source Serif Pro' );
		await page.click( 'role=radiogroup[name="Font size"i] >> role=radio[name="Large"i]' );
		await page.click( 'role=button[name="Appearance"i]' );

		await page.locator( '.components-custom-select-control__menu' );
		for ( let i = 0; i < 5; i++ ) {
			await page.keyboard.press( 'ArrowDown' );
		}
		await page.keyboard.press( 'Enter' );

		await page.fill( 'role=spinbutton[name="Line height"i]', '3' );
		await page.click( 'role=button[name="Lowercase"i]' );
		await page.fill( 'role=spinbutton[name="Letter spacing"i]', '10' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'dimensions settings should be applied', async ( { editor, page, fsbUtils } ) => {
		const wpVersion = await fsbUtils.getWpVersion();
		await fsbUtils.createFlexibleTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Styles"i]' );
		await page.click( 'role=button[name="Dimensions options"i]' );
		await page.click(
			'role=menu[name="Dimensions options"] >> role=menuitemcheckbox[name="Show Margin"]'
		);
		await page.click( 'role=button[name="Dimensions options"i]' );

		if ( wpVersion === '6-2' ) {
			await page.click( 'role=button[name="Unlink sides"i]' );
		} else {
			await page.click( 'role=button[name="Margin options"i]' );
			await page.click( 'role=menu[name="Margin options"i] >> role=menuitemradio[name="Custom"i]' );
		}

		for ( let i = 0; i < 4; i++ ) {
			await page.click( 'role=button[name="Set custom size"i] >> nth=0' );
		}

		await page.fill( 'role=spinbutton[name="Top margin"i]', '10' );
		await page.fill( 'role=spinbutton[name="Right margin"i]', '20' );
		await page.fill( 'role=spinbutton[name="Bottom margin"i]', '30' );
		await page.fill( 'role=spinbutton[name="Left margin"i]', '40' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
