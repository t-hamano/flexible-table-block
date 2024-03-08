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

	test( 'typography settings should be applied', async ( {
		editor,
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		// Open the sidebar.
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Styles' } )
			.click();
		// Show all typography controls.
		await page.getByRole( 'button', { name: 'Typography options' } ).click();
		for ( let i = 0; i < 6; i++ ) {
			await page
				.getByRole( 'menu', { name: 'Typography options' } )
				.getByRole( 'menuitemcheckbox' )
				.nth( i )
				.click();
		}
		await page.getByRole( 'button', { name: 'Typography options' } ).click();
		// Change font family.
		await page.getByRole( 'combobox', { name: 'Font' } ).selectOption( 'Source Serif Pro' );
		// Change font size.
		await page
			.getByRole( 'radiogroup', { name: 'Font size' } )
			.getByRole( 'radio', { name: 'Large', exact: true } )
			.click();
		// Change font appearance.
		await page.getByRole( 'button', { name: 'Appearance' } ).click();
		await page.getByRole( 'listbox', { name: 'Appearance' } );
		await pageUtils.pressKeys( 'ArrowDown', { times: 5 } );
		await pageUtils.pressKeys( 'Enter' );
		// Change line height.
		await page.getByRole( 'spinbutton', { name: 'Line height' } ).fill( '3' );
		// Change letter case.
		await page.getByRole( 'button', { name: 'Lowercase' } ).click();
		// Change letter spacing.
		await page.getByRole( 'spinbutton', { name: 'Letter spacing' } ).fill( '10' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'dimensions settings should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		// Open the sidebar.
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Styles' } )
			.click();
		// Show margin control.
		await page.getByRole( 'button', { name: 'Dimensions options' } ).click();
		await page
			.getByRole( 'menu', { name: 'Dimensions options' } )
			.getByRole( 'menuitemcheckbox', { name: 'Show Margin' } )
			.click();
		await page.getByRole( 'button', { name: 'Dimensions options' } ).click();
		// Show custom controls.
		await page.getByRole( 'button', { name: 'Margin options' } ).click();
		await page
			.getByRole( 'menu', { name: 'Margin options' } )
			.getByRole( 'menuitemradio', { name: 'Custom' } )
			.click();
		// Change margin values.
		for ( let i = 0; i < 4; i++ ) {
			await page.getByRole( 'button', { name: 'Set custom size' } ).nth( 0 ).click();
		}
		await page.getByRole( 'spinbutton', { name: 'Top margin' } ).fill( '10' );
		await page.getByRole( 'spinbutton', { name: 'Right margin' } ).fill( '20' );
		await page.getByRole( 'spinbutton', { name: 'Bottom margin' } ).fill( '30' );
		await page.getByRole( 'spinbutton', { name: 'Left margin' } ).fill( '40' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
