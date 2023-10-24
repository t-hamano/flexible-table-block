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

test.describe( 'Flexible table cell', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'allows cell movement with tab key.', async ( { editor, page, pageUtils, fsbUtils } ) => {
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

		// Update Editor Option.
		await page.click( 'role=tab[name="Editor options"i]' );
		await page.locator( 'role=checkbox[name="Use the tab key to move cells"i]' ).check();
		await page.click( 'role=button[name="Save settings"i]' );
		await page.click( '.ftb-global-setting-modal__notice >> role=button' );
		await page.click( 'role=dialog >> role=button[name="Close"i]' );

		// Try to move within cells.
		await page
			.locator( 'role=rowgroup >> nth=0 >> role=textbox[name="Body cell text"i] >> nth=0' )
			.click();
		await page.keyboard.type( 'Cell 1' );
		await pageUtils.pressKeys( 'Tab' );
		await pageUtils.pressKeys( 'Tab' );
		await pageUtils.pressKeys( 'shift+Tab' );
		await page.keyboard.type( 'Cell 2' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows keyboard operation within the link popover', async ( {
		editor,
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		const wpVersion = await fsbUtils.getWpVersion();
		await fsbUtils.createFlexibleTableBlock();
		await page
			.locator( 'role=rowgroup >> nth=0 >> role=textbox[name="Body cell text"i] >> nth=0' )
			.click();
		await page.keyboard.type( 'Link' );
		await pageUtils.pressKeys( 'primary+a' );
		await editor.clickBlockToolbarButton( 'Link' );

		// Create a link.
		await page.keyboard.type( '#anchor' );
		await page.keyboard.press( 'Enter' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();

		// Edit the link.
		await pageUtils.pressKeys( 'primary+a' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Enter' );
		if ( [ '6-3', '6-4' ].includes( wpVersion ) ) {
			await page.fill( 'role=combobox[name="Link"i]', '#anchor-updated' );
		} else {
			await page.fill( 'role=combobox[name="URL"i]', '#anchor-updated' );
		}
		await page.keyboard.press( 'Enter' );

		// Toggle "Open in new tab".
		await pageUtils.pressKeys( 'primary+a' );
		if ( [ '6-3', '6-4' ].includes( wpVersion ) ) {
			await page.keyboard.press( 'Tab' );
			await page.keyboard.press( 'Tab' );
			await page.keyboard.press( 'Enter' );
			await page.click( '.block-editor-link-control__tools >> role=button[name="Advanced"i]' );
			await page.locator( 'role=checkbox[name="Open in new tab"i]' ).check();
			await page.click( 'role=button[name="Save"i]' );
		} else {
			await page.locator( 'role=checkbox[name="Open in new tab"i]' ).click();
		}

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
