/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Flexible table cell', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
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

		expect( await editor.getEditedPostContent() ).toContain( '<a href="#anchor">Link</a>' );

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

		expect( await editor.getEditedPostContent() ).toContain(
			'<a href="#anchor-updated" target="_blank" rel="noopener">Link</a>'
		);
	} );
} );
