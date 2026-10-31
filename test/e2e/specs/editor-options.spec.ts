/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import type { Editor, RequestUtils } from '@wordpress/e2e-test-utils-playwright';

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

test.describe( 'Editor options', () => {
	test.afterEach( async ( { requestUtils } ) => {
		// Restore the default settings.
		await requestUtils.rest( {
			method: 'DELETE',
			path: '/flexible-table-block/v1/options',
		} );
	} );

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
		const getDotContent = ( th: HTMLElement ) => window.getComputedStyle( th, '::before' ).content;

		test( 'should show a dot on th cells when enabled', async ( { admin, editor, fsbUtils } ) => {
			await admin.createNewPost();
			await fsbUtils.createFlexibleTableBlock( { header: true } );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			const th = editor.canvas.locator( 'th' ).first();
			expect( await th.evaluate( getDotContent ) ).toBe( '""' );
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
			expect( await th.evaluate( getDotContent ) ).toBe( 'none' );
		} );
	} );

	test.describe( 'Keep all contents when merging cells', () => {
		async function mergeFirstTwoCells( { editor, page }: { editor: Editor; page: Page } ) {
			const cells = editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } );
			await cells.nth( 0 ).fill( 'Cell 1' );
			await cells.nth( 1 ).fill( 'Cell 2' );
			await cells.nth( 0 ).click();
			await page.keyboard.down( 'Shift' );
			await cells.nth( 1 ).click();
			await page.keyboard.up( 'Shift' );
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
		}

		test( 'should keep only the first cell content when disabled', async ( {
			admin,
			editor,
			page,
			fsbUtils,
		} ) => {
			await admin.createNewPost();
			await fsbUtils.createFlexibleTableBlock();
			await mergeFirstTwoCells( { editor, page } );
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
			await mergeFirstTwoCells( { editor, page } );
			expect( await editor.getEditedPostContent() ).toContain(
				'<td colspan="2">Cell 1<br>Cell 2</td>'
			);
		} );
	} );
} );
