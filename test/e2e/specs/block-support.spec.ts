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
		const wpVersion = await fsbUtils.getWpVersion();
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
		const fontFamily = [ '6-3' ].includes( wpVersion )
			? // WP6.3 (Twenty Twenty-Three)
			  'Source Serif Pro'
			: // WP6.4, 6.5, 6.6 (Twenty Twenty-Four)
			  'System Sans-serif';
		await page.getByRole( 'combobox', { name: 'Font' } ).selectOption( fontFamily );
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

		const expected = [ '6-3' ].includes( wpVersion )
			? // WP6.3
			  `<!-- wp:flexible-table-block/table {\"style\":{\"typography\":{\"fontStyle\":\"normal\",\"fontWeight\":\"500\",\"lineHeight\":\"3\",\"textTransform\":\"lowercase\",\"letterSpacing\":\"10px\"}},\"fontSize\":\"large\",\"fontFamily\":\"source-serif-pro\"} -->
<figure class=\"wp-block-flexible-table-block-table has-source-serif-pro-font-family has-large-font-size\" style=\"font-style:normal;font-weight:500;letter-spacing:10px;line-height:3;text-transform:lowercase\"><table class=\"has-fixed-layout\"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			: // WP6.4, 6.5, 6.6
			  `<!-- wp:flexible-table-block/table {\"style\":{\"typography\":{\"fontStyle\":\"normal\",\"fontWeight\":\"500\",\"lineHeight\":\"3\",\"textTransform\":\"lowercase\",\"letterSpacing\":\"10px\"}},\"fontSize\":\"large\",\"fontFamily\":\"system-sans-serif\"} -->
<figure class=\"wp-block-flexible-table-block-table has-system-sans-serif-font-family has-large-font-size\" style=\"font-style:normal;font-weight:500;letter-spacing:10px;line-height:3;text-transform:lowercase\"><table class=\"has-fixed-layout\"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`;

		expect( await editor.getEditedPostContent() ).toBe( expected );
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
