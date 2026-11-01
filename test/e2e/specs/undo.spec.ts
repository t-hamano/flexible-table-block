/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Undo', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should undo cell edits and table operations one by one in reverse order', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		const undo = () =>
			page
				.getByRole( 'region', { name: 'Editor top bar' } )
				.getByRole( 'button', { name: 'Undo', exact: true } )
				.click();
		const table = ( rows: string ) =>
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody>${ rows }</tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`;

		await fsbUtils.createFlexibleTableBlock( { col: 2, row: 1 } );
		const cells = editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } );

		// Type in a cell, insert a row, type in another cell and merge cells.
		await cells.nth( 0 ).fill( 'Cell 1' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.getByRole( 'menuitem', { name: 'Insert row after' } ).click();
		await cells.nth( 1 ).fill( 'Cell 2' );
		await cells.nth( 0 ).click();
		await page.keyboard.down( 'Shift' );
		await cells.nth( 1 ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
		expect( await editor.getEditedPostContent() ).toBe(
			table( '<tr><td colspan="2">Cell 1</td></tr><tr><td></td><td></td></tr>' )
		);

		// Undo merging cells.
		await undo();
		expect( await editor.getEditedPostContent() ).toBe(
			table( '<tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td></td><td></td></tr>' )
		);

		// Undo typing in the second cell.
		await undo();
		expect( await editor.getEditedPostContent() ).toBe(
			table( '<tr><td>Cell 1</td><td></td></tr><tr><td></td><td></td></tr>' )
		);

		// Undo inserting a row.
		await undo();
		expect( await editor.getEditedPostContent() ).toBe(
			table( '<tr><td>Cell 1</td><td></td></tr>' )
		);

		// Undo typing in the first cell.
		await undo();
		expect( await editor.getEditedPostContent() ).toBe( table( '<tr><td></td><td></td></tr>' ) );

		// Undo creating the table.
		await undo();
		await expect( editor.canvas.getByRole( 'button', { name: 'Create Table' } ) ).toBeVisible();
	} );
} );
