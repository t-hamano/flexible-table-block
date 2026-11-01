/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Block Support', () => {
	let previousTheme: string | undefined;

	test.beforeAll( async ( { requestUtils } ) => {
		const themes = await requestUtils.rest< { stylesheet: string }[] >( {
			path: '/wp/v2/themes',
			params: { status: 'active' },
		} );
		previousTheme = themes[ 0 ]?.stylesheet;
		await requestUtils.activateTheme( 'twentytwentyfour' );
	} );

	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		if ( previousTheme ) {
			await requestUtils.activateTheme( previousTheme );
		}
	} );

	test( 'typography settings should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		// Open the sidebar.
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Styles' } )
			.click();
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

		expect( await editor.getEditedPostContent() ).toContain(
			'<figure class="wp-block-flexible-table-block-table has-system-sans-serif-font-family has-large-font-size" style="font-style:normal;font-weight:500;letter-spacing:10px;line-height:3;text-transform:lowercase">'
		);
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
			.getByRole( 'menuitemcheckbox', { name: 'Margin' } )
			.click();
		await page.getByRole( 'button', { name: 'Dimensions options' } ).click();
		// Show custom controls.
		await page.getByRole( 'button', { name: 'Unlink' } ).click();
		// Change margin values.
		for ( let i = 0; i < 4; i++ ) {
			await page.getByRole( 'button', { name: 'Set custom value' } ).first().click();
		}
		await page.getByRole( 'spinbutton', { name: 'Top margin' } ).fill( '10' );
		await page.getByRole( 'spinbutton', { name: 'Right margin' } ).fill( '20' );
		await page.getByRole( 'spinbutton', { name: 'Bottom margin' } ).fill( '30' );
		await page.getByRole( 'spinbutton', { name: 'Left margin' } ).fill( '40' );

		expect( await editor.getEditedPostContent() ).toContain(
			'<figure class="wp-block-flexible-table-block-table" style="margin-top:10px;margin-right:20px;margin-bottom:30px;margin-left:40px">'
		);
	} );
} );
