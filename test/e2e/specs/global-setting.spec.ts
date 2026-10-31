/**
 * WordPress dependencies
 */
import type { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { test, expect } from '../util';

async function updateOptions( requestUtils: RequestUtils, options: Record< string, boolean > ) {
	await requestUtils.rest( {
		method: 'POST',
		path: '/flexible-table-block/v1/options',
		data: options,
	} );
}

test.describe( 'Global Setting', () => {
	test.afterEach( async ( { requestUtils } ) => {
		// Restore the default settings.
		await requestUtils.rest( {
			method: 'DELETE',
			path: '/flexible-table-block/v1/options',
		} );
	} );

	test.describe( 'Styles', () => {
		test.beforeEach( async ( { admin } ) => {
			await admin.createNewPost();
		} );

		test( 'should update editor styles reflecting the settings', async ( {
			editor,
			page,
			pageUtils,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock();
			// Open the global setting.
			await editor.openDocumentSettingsSidebar();
			await page.getByRole( 'button', { name: 'Global setting', exact: true } ).click();
			await page.getByRole( 'button', { name: 'Edit global setting' } ).click();
			const modal = page.getByRole( 'dialog', { name: 'Flexible Table Block Global setting' } );
			// Restore settings.
			await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
			await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
			await expect( modal.getByText( 'Global setting restored.', { exact: true } ) ).toBeVisible();
			await modal.getByRole( 'button', { name: 'Dismiss' } ).click();
			// Change table width.
			await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '90' );
			// Change table max width.
			await page.getByRole( 'spinbutton', { name: 'Table max width' } ).fill( '110' );
			await page.getByRole( 'button', { name: 'Separate' } ).click();
			// Change striped colors.
			const tableColors = [
				{ color: '111111', label: 'Striped style background color ( odd rows )' },
				{ color: '222222', label: 'Striped style background color ( even rows )' },
			];
			for ( const { color, label } of tableColors ) {
				await modal.getByRole( 'button', { name: label, exact: true } ).click();
				await pageUtils.pressKeys( 'Enter' );
				await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
				await pageUtils.pressKeys( 'Escape', { times: 2 } );
			}
			// Apply cell styles.
			await page.getByRole( 'tab', { name: 'Cell styles' } ).click();
			// Change cell colors.
			const cellColors = [
				{ color: '333333', label: 'Cell text color ( th tag )' },
				{ color: '444444', label: 'Cell text color ( td tag )' },
				{ color: '555555', label: 'Cell background color ( th tag )' },
				{ color: '666666', label: 'Cell background color ( td tag )' },
				{ color: '777777', label: 'Cell border color' },
			];
			for ( const { color, label } of cellColors ) {
				await modal.getByRole( 'button', { name: label, exact: true } ).click();
				await pageUtils.pressKeys( 'Enter' );
				await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
				await pageUtils.pressKeys( 'Escape', { times: 2 } );
			}
			// Change cell padding.
			await page.getByRole( 'button', { name: 'Unlink sides' } ).click();
			await page.getByRole( 'spinbutton', { name: 'Top' } ).fill( '1' );
			await page.getByRole( 'spinbutton', { name: 'Right' } ).fill( '2' );
			await page.getByRole( 'spinbutton', { name: 'Bottom' } ).fill( '3' );
			await page.getByRole( 'spinbutton', { name: 'Left' } ).fill( '4' );
			// Change cell border width.
			await page.getByRole( 'spinbutton', { name: 'All' } ).fill( '2' );
			// Change cell border style.
			await page.getByRole( 'button', { name: 'Dotted' } ).click();
			// Change cell alignments.
			await page.getByRole( 'button', { name: 'Align center' } ).click();
			await page.getByRole( 'button', { name: 'Align bottom' } ).click();
			// Save settings.
			await page.getByRole( 'button', { name: 'Save settings' } ).click();
			await expect( modal.getByText( 'Global setting saved.', { exact: true } ) ).toBeVisible();
			await modal.getByRole( 'button', { name: 'Dismiss' } ).click();

			const selector = '.wp-block-flexible-table-block-table.wp-block-flexible-table-block-table';
			const savedRules = [
				`${ selector }>table{width:90%;max-width:110%;border-collapse:separate;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(odd) th{background-color:#111111;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(odd) td{background-color:#111111;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(even) th{background-color:#222222;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(even) td{background-color:#222222;}`,
				`${ selector }>table tr th,${ selector }>table tr td{padding:1em 2em 3em 4em;border-width:2px;border-style:dotted;border-color:#777777;text-align:center;vertical-align:bottom;}`,
				`${ selector }>table tr th{color:#333333;background-color:#555555;}`,
				`${ selector }>table tr td{color:#444444;background-color:#666666;}`,
			];
			await expect.poll( () => fsbUtils.getGlobalSettingCss() ).toBe( savedRules.join( '' ) );

			// Restore settings.
			await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
			await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
			await expect( modal.getByText( 'Global setting restored.', { exact: true } ) ).toBeVisible();
			await modal.getByRole( 'button', { name: 'Dismiss' } ).click();

			const defaultRules = [
				`${ selector }>table{width:100%;max-width:100%;border-collapse:collapse;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(odd) th{background-color:#f0f0f1;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(odd) td{background-color:#f0f0f1;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(even) th{background-color:#ffffff;}`,
				`${ selector }.is-style-stripes tbody tr:nth-child(even) td{background-color:#ffffff;}`,
				`${ selector }>table tr th,${ selector }>table tr td{padding:0.5em;border-width:1px;border-style:solid;border-color:#000000;text-align:left;vertical-align:middle;}`,
				`${ selector }>table tr th{background-color:#f0f0f1;}`,
				`${ selector }>table tr td{background-color:#ffffff;}`,
			];
			await expect.poll( () => fsbUtils.getGlobalSettingCss() ).toBe( defaultRules.join( '' ) );
		} );
	} );

	test.describe( 'Editor options', () => {
		test.describe( 'Show section labels', () => {
			test( 'should show section labels when enabled', async ( { admin, editor, fsbUtils } ) => {
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
				await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
				for ( const label of [ 'thead', 'tbody', 'tfoot' ] ) {
					await expect(
						editor.canvas.getByRole( 'button', { name: label, exact: true } )
					).toBeVisible();
				}
			} );

			test( 'should hide section labels when disabled', async ( {
				admin,
				editor,
				requestUtils,
				fsbUtils,
			} ) => {
				await updateOptions( requestUtils, { show_label_on_section: false } );
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
				await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
				for ( const label of [ 'thead', 'tbody', 'tfoot' ] ) {
					await expect(
						editor.canvas.getByRole( 'button', { name: label, exact: true } )
					).toBeHidden();
				}
			} );
		} );

		test.describe( 'Show control buttons', () => {
			const controlButtons = [
				'Insert row before',
				'Insert row after',
				'Insert column before',
				'Insert column after',
				'Select row',
				'Select column',
			];

			test( 'should show control buttons when enabled', async ( { admin, editor, fsbUtils } ) => {
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock();
				await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
				for ( const label of controlButtons ) {
					await expect(
						editor.canvas.getByRole( 'button', { name: label, exact: true } ).first()
					).toBeVisible();
				}
			} );

			test( 'should hide control buttons when disabled', async ( {
				admin,
				editor,
				requestUtils,
				fsbUtils,
			} ) => {
				await updateOptions( requestUtils, { show_control_button: false } );
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock();
				await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
				for ( const label of controlButtons ) {
					await expect(
						editor.canvas.getByRole( 'button', { name: label, exact: true } )
					).toHaveCount( 0 );
				}
			} );
		} );

		test.describe( 'Show dot on th tag', () => {
			test( 'should show a dot on th cells when enabled', async ( { admin, editor, fsbUtils } ) => {
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock( { header: true } );
				await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
				const th = editor.canvas.locator( 'th' ).first();
				expect(
					await th.evaluate( ( el ) => window.getComputedStyle( el, '::before' ).content )
				).toBe( '""' );
			} );

			test( 'should not show a dot on th cells when disabled', async ( {
				admin,
				editor,
				requestUtils,
				fsbUtils,
			} ) => {
				await updateOptions( requestUtils, { show_dot_on_th: false } );
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock( { header: true } );
				await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
				const th = editor.canvas.locator( 'th' ).first();
				expect(
					await th.evaluate( ( el ) => window.getComputedStyle( el, '::before' ).content )
				).toBe( 'none' );
			} );
		} );

		test.describe( 'Use the tab key to move cells', () => {
			test( 'should move focus out of the table with the tab key when disabled', async ( {
				admin,
				editor,
				pageUtils,
				fsbUtils,
			} ) => {
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock();
				const cells = editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } );
				await cells.nth( 0 ).click();
				await pageUtils.pressKeys( 'Tab' );
				// The block editor moves focus to the first tabbable element after the canvas.
				await expect( cells.nth( 0 ) ).not.toBeFocused();
				await expect( cells.nth( 1 ) ).not.toBeFocused();
			} );

			test( 'should move focus between cells with the tab key when enabled', async ( {
				admin,
				editor,
				page,
				pageUtils,
				requestUtils,
				fsbUtils,
			} ) => {
				await updateOptions( requestUtils, { tab_move: true } );
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock();
				await editor.canvas
					.getByRole( 'textbox', { name: 'Body cell text' } )
					.nth( 0 )
					.fill( 'Cell 1' );
				await pageUtils.pressKeys( 'Tab', { times: 2 } );
				await pageUtils.pressKeys( 'shift+Tab' );
				await page.keyboard.type( 'Cell 2' );
				expect( await editor.getEditedPostContent() ).toContain(
					'<tr><td>Cell 1</td><td>Cell 2</td><td></td></tr>'
				);
			} );
		} );

		test.describe( 'Keep all contents when merging cells', () => {
			test( 'should keep only the first cell content when disabled', async ( {
				admin,
				editor,
				page,
				fsbUtils,
			} ) => {
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock();
				const cells = editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } );
				await cells.nth( 0 ).fill( 'Cell 1' );
				await cells.nth( 1 ).fill( 'Cell 2' );
				await cells.nth( 0 ).click();
				await page.keyboard.down( 'Shift' );
				await cells.nth( 1 ).click();
				await page.keyboard.up( 'Shift' );
				await editor.clickBlockToolbarButton( 'Edit table' );
				await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
				expect( await editor.getEditedPostContent() ).toContain( '<td colspan="2">Cell 1</td>' );
			} );

			test( 'should keep all cell contents when enabled', async ( {
				admin,
				editor,
				page,
				requestUtils,
				fsbUtils,
			} ) => {
				await updateOptions( requestUtils, { merge_content: true } );
				await admin.createNewPost();
				await fsbUtils.createFlexibleTableBlock();
				const cells = editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } );
				await cells.nth( 0 ).fill( 'Cell 1' );
				await cells.nth( 1 ).fill( 'Cell 2' );
				await cells.nth( 0 ).click();
				await page.keyboard.down( 'Shift' );
				await cells.nth( 1 ).click();
				await page.keyboard.up( 'Shift' );
				await editor.clickBlockToolbarButton( 'Edit table' );
				await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
				expect( await editor.getEditedPostContent() ).toContain(
					'<td colspan="2">Cell 1<br>Cell 2</td>'
				);
			} );
		} );
	} );
} );
