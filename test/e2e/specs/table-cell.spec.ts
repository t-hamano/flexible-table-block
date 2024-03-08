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
		await page.getByRole( 'button', { name: 'Global setting' } ).click();

		// Restore settings.
		await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
		await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
		await expect( page.locator( '.ftb-global-setting-modal__notice' ) ).toContainText(
			'Global setting restored.'
		);
		await page.locator( '.ftb-global-setting-modal__notice ' ).getByRole( 'button' ).click();

		// Update Editor Option.
		await page.getByRole( 'tab', { name: 'Editor options' } ).click();
		await page.getByRole( 'checkbox', { name: 'Use the tab key to move cells' } ).check();
		await page.getByRole( 'button', { name: 'Save settings' } ).click();
		await page.locator( '.ftb-global-setting-modal__notice' ).getByRole( 'button' ).click();
		await page
			.getByRole( 'dialog', { name: 'Flexible Table Block Global setting' } )
			.getByRole( 'button', { name: 'Close' } )
			.click();
		// Try to move within cells.
		await page.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).fill( 'Cell 1' );
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
		await page.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).fill( 'Link' );
		await pageUtils.pressKeys( 'primary+a' );
		await editor.clickBlockToolbarButton( 'Link' );

		// Create a link.
		await page.keyboard.type( '#anchor' );
		await pageUtils.pressKeys( 'Enter' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();

		// Edit the link.
		if ( [ '6-3', '6-4' ].includes( wpVersion ) ) {
			// WP6.3, 6.4
			await pageUtils.pressKeys( 'primary+a' );
			await pageUtils.pressKeys( 'Tab', { times: 2 } );
			await pageUtils.pressKeys( 'Enter' );
		} else {
			// WP6.5, 6.6
			await pageUtils.pressKeys( 'Tab' );
			await pageUtils.pressKeys( 'Enter' );
		}

		await page.getByRole( 'combobox', { name: 'Link' } ).fill( '#anchor-updated' );
		await pageUtils.pressKeys( 'Enter' );

		// Toggle "Open in new tab".
		if ( [ '6-3', '6-4' ].includes( wpVersion ) ) {
			// WP6.3, 6.4
			await pageUtils.pressKeys( 'primary+a' );
			await pageUtils.pressKeys( 'Tab', { times: 2 } );
			await pageUtils.pressKeys( 'Enter' );
		} else {
			// WP6.5, 6.6
			await pageUtils.pressKeys( 'Enter' );
			await pageUtils.pressKeys( 'Tab' );
			await pageUtils.pressKeys( 'Enter' );
		}
		await page
			.locator( '.block-editor-link-control__tools ' )
			.getByRole( 'button', { name: 'Advanced' } )
			.click();
		await page.getByRole( 'checkbox', { name: 'Open in new tab' } ).click();
		await page.getByRole( 'button', { name: 'Save', exact: true } ).click();

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
