/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import type { PageUtils } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { test, expect } from '../util';

async function applyCellStyles( page: Page, pageUtils: PageUtils ) {
	// Font Size, Line Hiehgt, Width styles.
	await page.getByRole( 'spinbutton', { name: 'Cell font size' } ).fill( '20' );
	await page.getByRole( 'spinbutton', { name: 'Cell line height' } ).fill( '2' );
	await page.getByRole( 'spinbutton', { name: 'Cell width' } ).fill( '100' );

	// Text Color, Background Color styles.
	await page.getByRole( 'button', { name: 'Cell text color', exact: true } ).click();
	await pageUtils.pressKeys( 'Enter' );
	await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( '111111' );
	await pageUtils.pressKeys( 'Escape', { times: 2 } );
	await page.getByRole( 'button', { name: 'Cell background color', exact: true } ).click();
	await pageUtils.pressKeys( 'Enter' );
	await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( '333333' );
	await pageUtils.pressKeys( 'Escape', { times: 2 } );

	// Padding, Border Radius, Border Width styles.
	const styles = [
		{
			group: 'Cell padding',
			labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
		},
		{
			group: 'Cell border radius',
			labels: [ 'Top left', 'Top right', 'Bottom right', 'Bottom left' ],
		},
		{
			group: 'Cell border width',
			labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
		},
	];
	for ( let i = 0; i < styles.length; i++ ) {
		const { group, labels } = styles[ i ];
		await page
			.getByRole( 'group', { name: group } )
			.getByRole( 'button', { name: 'Unlink sides' } )
			.click();
		for ( let j = 0; j < labels.length; j++ ) {
			await page
				.getByRole( 'group', { name: group } )
				.getByRole( 'spinbutton', { name: labels[ j ] } )
				.fill( ( j + 1 ).toString() );
		}
	}

	// Boder Style styles.
	const cellBorderStyle = page.getByRole( 'group', { name: 'Cell border style' } );
	await cellBorderStyle.getByRole( 'button', { name: 'Unlink sides' } ).click();
	await cellBorderStyle
		.getByRole( 'group', { name: 'Top', exact: true } )
		.getByRole( 'button', { name: 'Solid', exact: true } )
		.click();
	await cellBorderStyle
		.getByRole( 'group', { name: 'Right', exact: true } )
		.getByRole( 'button', { name: 'Dotted', exact: true } )
		.click();
	await cellBorderStyle
		.getByRole( 'group', { name: 'Bottom', exact: true } )
		.getByRole( 'button', { name: 'Dashed', exact: true } )
		.click();
	await cellBorderStyle
		.getByRole( 'group', { name: 'Left', exact: true } )
		.getByRole( 'button', { name: 'Double', exact: true } )
		.click();

	// Border Color styles.
	await page
		.getByRole( 'group', { name: 'Cell border color' } )
		.getByRole( 'button', { name: 'Unlink sides' } )
		.click();
	const colors = [
		{ color: '111111', label: 'Top' },
		{ color: '222222', label: 'Right' },
		{ color: '333333', label: 'Bottom' },
		{ color: '444444', label: 'Left' },
	];
	for ( const { color, label } of colors ) {
		await page
			.getByRole( 'group', { name: 'Cell border color' } )
			.getByRole( 'button', { name: label } )
			.click();
		await pageUtils.pressKeys( 'Enter' );
		await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
		await pageUtils.pressKeys( 'Escape', { times: 2 } );
	}
	// Cell Alignment styles.
	await page.getByRole( 'button', { name: 'Align center' } ).click();
	await page.getByRole( 'button', { name: 'Align middle' } ).click();
	// Cell Tag element.
	await page.getByRole( 'radio', { name: 'TD' } ).click();
	await page.getByRole( 'radio', { name: 'TH' } ).click();
	// Cell CSS class.
	await page.getByRole( 'textbox', { name: 'Cell CSS class(es)' } ).fill( 'custom' );
	// id, headers, scope getBlockAttributes.
	await page.getByRole( 'textbox', { name: 'id attribute' } ).fill( 'id' );
	await page.getByRole( 'textbox', { name: 'headers attribute' } ).fill( 'headers' );
	await page.getByRole( 'combobox', { name: 'scope attribute' } ).click();
	await page.getByRole( 'option', { name: 'row', exact: true } ).click();
}

test.describe( 'Styles', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'table styles should be applied', async ( { editor, page, pageUtils, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Table settings' } ).click();

		// Toggle settings.
		await page.getByRole( 'switch', { name: 'Fixed width table cells' } ).uncheck();
		await page.getByRole( 'switch', { name: 'Scroll on desktop view' } ).check();
		await page.getByRole( 'switch', { name: 'Scroll on mobile view' } ).check();
		await page.getByRole( 'switch', { name: 'Stack on mobile' } ).check();
		await page.getByRole( 'combobox', { name: 'Fixed control' } ).click();
		await page.getByRole( 'option', { name: 'Fixed first column' } ).click();

		// Width styles.
		await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '500' );
		// Change table max width.
		await page.getByRole( 'spinbutton', { name: 'Table max width' } ).fill( '600' );
		await page.getByRole( 'spinbutton', { name: 'Table min width' } ).fill( '400' );
		// Change table min height.
		await page.getByRole( 'spinbutton', { name: 'Table min height' } ).fill( '300' );
		// Padding, Border Radius, Border Width styles.
		const styles = [
			{
				group: 'Table padding',
				labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
			},
			{
				group: 'Table border radius',
				labels: [ 'Top left', 'Top right', 'Bottom right', 'Bottom left' ],
			},
			{
				group: 'Table border width',
				labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
			},
		];
		for ( let i = 0; i < styles.length; i++ ) {
			const { group, labels } = styles[ i ];
			await page
				.getByRole( 'group', { name: group } )
				.getByRole( 'button', { name: 'Unlink sides' } )
				.click();
			for ( let j = 0; j < labels.length; j++ ) {
				await page
					.getByRole( 'group', { name: group } )
					.getByRole( 'spinbutton', { name: labels[ j ] } )
					.fill( ( j + 1 ).toString() );
			}
		}

		// Boder Style styles.
		const tableBorderStyle = page.getByRole( 'group', { name: 'Table border style' } );
		await tableBorderStyle.getByRole( 'button', { name: 'Unlink sides' } ).click();
		await tableBorderStyle
			.getByRole( 'group', { name: 'Top', exact: true } )
			.getByRole( 'button', { name: 'Solid', exact: true } )
			.click();
		await tableBorderStyle
			.getByRole( 'group', { name: 'Right', exact: true } )
			.getByRole( 'button', { name: 'Dotted', exact: true } )
			.click();
		await tableBorderStyle
			.getByRole( 'group', { name: 'Bottom', exact: true } )
			.getByRole( 'button', { name: 'Dashed', exact: true } )
			.click();
		await tableBorderStyle
			.getByRole( 'group', { name: 'Left', exact: true } )
			.getByRole( 'button', { name: 'Double', exact: true } )
			.click();

		// Border Color styles.
		await page
			.getByRole( 'group', { name: 'Table border color' } )
			.getByRole( 'button', { name: 'Unlink sides' } )
			.click();
		const colors = [
			{ color: '111111', label: 'Top' },
			{ color: '222222', label: 'Right' },
			{ color: '333333', label: 'Bottom' },
			{ color: '444444', label: 'Left' },
		];
		for ( const { color, label } of colors ) {
			await page
				.getByRole( 'group', { name: 'Table border color' } )
				.getByRole( 'button', { name: label } )
				.click();
			await pageUtils.pressKeys( 'Enter' );
			await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
			await pageUtils.pressKeys( 'Escape', { times: 2 } );
		}

		// Border Spacing styles.
		await page.getByRole( 'button', { name: 'Separate' } ).click();
		await page.getByRole( 'button', { name: 'Unlink directions' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Horizontal' } ).fill( '10' );
		await page.getByRole( 'spinbutton', { name: 'Vertical' } ).fill( '20' );
		expect( await editor.getEditedPostContent() ).toContain(
			'<figure class="wp-block-flexible-table-block-table is-scroll-on-pc is-scroll-on-mobile"><table class="is-stacked-on-mobile is-sticky-first-column" style="width:500px;max-width:600px;min-width:400px;min-height:300px;padding:1px 2px 3px 4px;border-radius:1px 2px 3px 4px;border-width:1px 2px 3px 4px;border-style:solid dotted dashed double;border-color:#111111 #222222 #333333 #444444;border-collapse:separate;border-spacing:10px 20px">'
		);
	} );

	test( 'cell styles should be applied', async ( { editor, page, pageUtils, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Cell settings' } ).click();
		await applyCellStyles( page, pageUtils );
		expect( await editor.getEditedPostContent() ).toContain(
			'<th class="custom" id="id" headers="headers" scope="row" style="font-size:20px;line-height:2;width:100px;color:#111111;background-color:#333333;padding:1px 2px 3px 4px;border-radius:1px 2px 3px 4px;border-width:1px 2px 3px 4px;border-style:solid dotted dashed double;border-color:#111111 #222222 #333333 #444444;text-align:center;vertical-align:middle"></th>'
		);
	} );

	test( 'cell styles should be applied to multiple cells', async ( {
		editor,
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await editor.canvas.getByRole( 'button', { name: 'Select column' } ).nth( 2 ).click();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Multi cells settings' } ).click();
		await applyCellStyles( page, pageUtils );
		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><thead><tr><th></th><th></th><th class="custom" id="id" headers="headers" scope="row" style="font-size:20px;line-height:2;width:100px;color:#111111;background-color:#333333;padding:1px 2px 3px 4px;border-radius:1px 2px 3px 4px;border-width:1px 2px 3px 4px;border-style:solid dotted dashed double;border-color:#111111 #222222 #333333 #444444;text-align:center;vertical-align:middle"></th></tr></thead><tbody><tr><td></td><td></td><th class="custom" id="id" headers="headers" scope="row" style="font-size:20px;line-height:2;width:100px;color:#111111;background-color:#333333;padding:1px 2px 3px 4px;border-radius:1px 2px 3px 4px;border-width:1px 2px 3px 4px;border-style:solid dotted dashed double;border-color:#111111 #222222 #333333 #444444;text-align:center;vertical-align:middle"></th></tr><tr><td></td><td></td><th class="custom" id="id" headers="headers" scope="row" style="font-size:20px;line-height:2;width:100px;color:#111111;background-color:#333333;padding:1px 2px 3px 4px;border-radius:1px 2px 3px 4px;border-width:1px 2px 3px 4px;border-style:solid dotted dashed double;border-color:#111111 #222222 #333333 #444444;text-align:center;vertical-align:middle"></th></tr><tr><td></td><td></td><th class="custom" id="id" headers="headers" scope="row" style="font-size:20px;line-height:2;width:100px;color:#111111;background-color:#333333;padding:1px 2px 3px 4px;border-radius:1px 2px 3px 4px;border-width:1px 2px 3px 4px;border-style:solid dotted dashed double;border-color:#111111 #222222 #333333 #444444;text-align:center;vertical-align:middle"></th></tr></tbody><tfoot><tr><td></td><td></td><th class="custom" id="id" headers="headers" scope="row" style="font-size:20px;line-height:2;width:100px;color:#111111;background-color:#333333;padding:1px 2px 3px 4px;border-radius:1px 2px 3px 4px;border-width:1px 2px 3px 4px;border-style:solid dotted dashed double;border-color:#111111 #222222 #333333 #444444;text-align:center;vertical-align:middle"></th></tr></tfoot></table></figure>
<!-- /wp:flexible-table-block/table -->`
		);
	} );

	test( 'caption styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.clickBlockToolbarButton( 'Add caption' );
		await editor.canvas
			.getByRole( 'textbox', { name: 'Table caption text' } )
			.fill( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Caption settings' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Caption font size' } ).fill( '20' );
		await page.getByRole( 'spinbutton', { name: 'Caption line height' } ).fill( '2' );
		await page.getByRole( 'button', { name: 'Unlink sides' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Top' } ).fill( '1' );
		await page.getByRole( 'spinbutton', { name: 'Right' } ).fill( '2' );
		await page.getByRole( 'spinbutton', { name: 'Bottom' } ).fill( '3' );
		await page.getByRole( 'spinbutton', { name: 'Left' } ).fill( '4' );
		await page.getByRole( 'radio', { name: 'Top' } ).click();
		await page.getByRole( 'button', { name: 'Align center' } ).click();
		expect( await editor.getEditedPostContent() ).toContain(
			'<figure class="wp-block-flexible-table-block-table"><figcaption style="font-size:20px;line-height:2;padding:1px 2px 3px 4px;text-align:center">Flexible Table Block</figcaption><table'
		);
	} );
} );
