/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Flexible table cell', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'allows cell movement with tab key.', async ( { editor, page, pageUtils, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.openGlobalSetting();
		// Restore settings.
		await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
		await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
		await expect(
			fsbUtils.getGlobalSettingModal().getByText( 'Global setting restored.', { exact: true } )
		).toBeVisible();
		await fsbUtils.getGlobalSettingModal().getByRole( 'button', { name: 'Dismiss' } ).click();

		// Update Editor Option.
		await page.getByRole( 'tab', { name: 'Editor options' } ).click();
		await page.getByRole( 'switch', { name: 'Use the tab key to move cells' } ).check();
		await page.getByRole( 'button', { name: 'Save settings' } ).click();
		await expect(
			fsbUtils.getGlobalSettingModal().getByText( 'Global setting saved.', { exact: true } )
		).toBeVisible();
		await fsbUtils.getGlobalSettingModal().getByRole( 'button', { name: 'Dismiss' } ).click();
		await fsbUtils.getGlobalSettingModal().getByRole( 'button', { name: 'Close' } ).click();
		// Try to move within cells.
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 0 )
			.fill( 'Cell 1' );
		await pageUtils.pressKeys( 'Tab', { times: 2 } );
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
		await fsbUtils.createFlexibleTableBlock();
		await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).fill( 'Link' );
		await pageUtils.pressKeys( 'primary+a' );
		await editor.clickBlockToolbarButton( 'Link' );

		// Create a link.
		await page.keyboard.type( '#anchor' );
		await pageUtils.pressKeys( 'Enter' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();

		// Edit the link.
		await pageUtils.pressKeys( 'Tab' );
		await pageUtils.pressKeys( 'Enter' );
		await page.getByRole( 'combobox', { name: 'Link' } ).fill( '#anchor-updated' );
		await pageUtils.pressKeys( 'Enter' );

		// Toggle "Open in new tab".
		await pageUtils.pressKeys( 'Enter' );
		await pageUtils.pressKeys( 'Tab' );
		await pageUtils.pressKeys( 'Enter' );
		await page
			.getByRole( 'region', { name: 'Editor content' } )
			.getByRole( 'button', { name: 'Advanced', exact: true } )
			.click();
		await page.getByRole( 'checkbox', { name: 'Open in new tab' } ).click();
		await page.getByRole( 'button', { name: 'Apply', exact: true } ).click();

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
