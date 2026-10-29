/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Block Support', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.activateTheme( 'twentytwentyfour' );
	} );

	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'typography settings should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.openBlockSidebar( { tab: 'Styles' } );
		// Show all typography controls.
		await page.getByRole( 'button', { name: 'Typography options' } ).click();
		const typographyMenu = page.getByRole( 'menu', { name: 'Typography options' } );
		for ( const control of [
			'Font',
			'Appearance',
			'Line height',
			'Letter spacing',
			'Letter case',
		] ) {
			await typographyMenu.getByRole( 'menuitemcheckbox', { name: control } ).click();
		}
		await page.getByRole( 'button', { name: 'Typography options' } ).click();
		// Change font family.
		await page.getByRole( 'combobox', { name: 'Font' } ).click();
		await page.getByRole( 'option', { name: 'System Sans-serif' } ).click();
		// Change font size.
		await page
			.getByRole( 'radiogroup', { name: 'Font size' } )
			.getByRole( 'radio', { name: 'Large', exact: true } )
			.click();

		// Change font appearance.
		await page
			.getByRole( 'combobox', {
				name: 'Appearance',
			} )
			.click();
		await page.getByRole( 'option', { name: 'Medium', exact: true } ).click();
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
		await fsbUtils.openBlockSidebar( { tab: 'Styles' } );
		// Show margin control.
		await page.getByRole( 'button', { name: 'Dimensions options' } ).click();
		await page
			.getByRole( 'menu', { name: 'Dimensions options' } )
			.getByRole( 'menuitemcheckbox', { name: 'Margin' } )
			.click();
		await page.getByRole( 'button', { name: 'Dimensions options' } ).click();
		// Show custom controls.
		await page.getByRole( 'button', { name: 'Unlink' } ).click();
		// Switch each side to a custom value. The buttons share the same label, and each one
		// is replaced by an input once clicked, so always pick the first remaining one.
		const customValueButtons = page.getByRole( 'button', { name: 'Set custom value' } );
		for ( let i = 0; i < 4; i++ ) {
			await customValueButtons.first().click();
		}
		await expect( customValueButtons ).toHaveCount( 0 );
		await page.getByRole( 'spinbutton', { name: 'Top margin' } ).fill( '10' );
		await page.getByRole( 'spinbutton', { name: 'Right margin' } ).fill( '20' );
		await page.getByRole( 'spinbutton', { name: 'Bottom margin' } ).fill( '30' );
		await page.getByRole( 'spinbutton', { name: 'Left margin' } ).fill( '40' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
