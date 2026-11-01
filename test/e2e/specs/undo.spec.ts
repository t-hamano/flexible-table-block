/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Undo', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'allows to undo merging cells without undoing the cell content', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
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
		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td colspan="2">Cell 1</td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
		);
		await page
			.getByRole( 'region', { name: 'Editor top bar' } )
			.getByRole( 'button', { name: 'Undo', exact: true } )
			.click();
		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td>Cell 1</td><td>Cell 2</td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
		);
	} );
} );
