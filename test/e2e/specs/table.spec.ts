/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Flexible table', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should create block', async ( { editor } ) => {
		await editor.insertBlock( { name: 'flexible-table-block/table' } );
		await editor.canvas.getByRole( 'button', { name: 'Create Table' } ).click();
		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
		);
	} );

	test( 'should create block with option', async ( { editor } ) => {
		await editor.insertBlock( { name: 'flexible-table-block/table' } );
		await editor.canvas.getByRole( 'switch', { name: 'Header section' } ).check();
		await editor.canvas.getByRole( 'switch', { name: 'Footer section' } ).check();
		await editor.canvas.getByRole( 'spinbutton', { name: 'Column count' } ).fill( '4' );
		await editor.canvas.getByRole( 'spinbutton', { name: 'Row count' } ).fill( '4' );
		await editor.canvas.getByRole( 'button', { name: 'Create Table' } ).click();
		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><thead><tr><th></th><th></th><th></th><th></th></tr></thead><tbody><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></tbody><tfoot><tr><td></td><td></td><td></td><td></td></tr></tfoot></table></figure>
<!-- /wp:flexible-table-block/table -->`
		);
	} );

	test( 'should be inserted', async ( { editor, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 0 )
			.fill( 'Flexible Table Block' );
		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td>Flexible Table Block</td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
		);
	} );

	test.describe( 'Merging and Splitting Cells', () => {
		test( 'allows cells side by side to be merge', async ( { editor, page, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock();
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 1 ).click();
			await page.keyboard.up( 'Shift' );
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td colspan="2"></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );

		test( 'allows cells in a vertical line to be merge', async ( { editor, page, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock();
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 3 ).click();
			await page.keyboard.up( 'Shift' );
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td rowspan="2"></td><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );

		test( 'allows cells to be merge', async ( { editor, page, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock();
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 4 ).click();
			await page.keyboard.up( 'Shift' );
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td rowspan="2" colspan="2"></td><td></td></tr><tr><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );

		test( 'allows merged cells to be split', async ( { editor, page, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock();
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 4 ).click();
			await page.keyboard.up( 'Shift' );
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Split merged cells' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );

		test( 'disallows merging across sections', async ( { editor, page, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
			await editor.canvas.getByRole( 'button', { name: 'Select column' } ).nth( 0 ).click();
			await editor.clickBlockToolbarButton( 'Edit table' );
			const mergeButton = page.getByRole( 'menuitem', { name: 'Merge cells' } );
			await expect( mergeButton ).toBeDisabled();
		} );

		test( 'allows all cells side by side to be merge', async ( { editor, page, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock();
			await editor.canvas.getByRole( 'button', { name: 'Select row' } ).nth( 0 ).click();
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td colspan="3"></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );

		test( 'allows all cells in a vertical line to be merge', async ( {
			editor,
			page,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock();
			await editor.canvas.getByRole( 'button', { name: 'Select column' } ).nth( 1 ).click();
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td rowspan="3"></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );
	} );

	test.describe( 'Deleting Rows and Columns', () => {
		test( 'allows to delete rows even if they contain merged cells', async ( {
			editor,
			page,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 6 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 18 ).click();
			await page.keyboard.up( 'Shift' );
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			const selectRowButton = editor.canvas.getByRole( 'button', { name: 'Select row' } ).nth( 2 );
			await expect( selectRowButton ).toHaveAttribute( 'aria-pressed', 'false' );
			await selectRowButton.click();
			await expect( selectRowButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await page.getByRole( 'button', { name: 'Delete row' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td rowspan="2" colspan="3"></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );

		test( 'allows to delete column even if they contain merged cells.', async ( {
			editor,
			page,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 6 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 18 ).click();
			await page.keyboard.up( 'Shift' );
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
			const selectColumnButton = editor.canvas
				.getByRole( 'button', { name: 'Select column' } )
				.nth( 2 );
			await expect( selectColumnButton ).toHaveAttribute( 'aria-pressed', 'false' );
			await selectColumnButton.click();
			await expect( selectColumnButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await page.getByRole( 'button', { name: 'Delete column' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td rowspan="3" colspan="2"></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );

		test( 'allows to select and deselect the first column', async ( { editor, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock();
			const selectColumnButton = editor.canvas
				.getByRole( 'button', { name: 'Select column' } )
				.nth( 0 );
			await expect( selectColumnButton ).toHaveAttribute( 'aria-pressed', 'false' );
			await selectColumnButton.click();
			await expect( selectColumnButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await selectColumnButton.click();
			await expect( selectColumnButton ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		test( 'disallows to delete the only row in the table body', async ( {
			editor,
			page,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { header: true, footer: true, row: 1 } );
			await editor.canvas.getByRole( 'button', { name: 'Select row' } ).nth( 1 ).click();
			await page.getByRole( 'button', { name: 'Delete row' } ).click();
			const snackbar = page.getByRole( 'button', {
				name: 'Dismiss this notice',
			} );
			await expect( snackbar ).toHaveText( 'The table body must have one or more rows.' );
			await snackbar.click();
			await expect( snackbar ).toBeHidden();
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await editor.clickBlockToolbarButton( 'Edit table' );
			await page.getByRole( 'menuitem', { name: 'Delete row' } ).click();
			await expect(
				page.getByRole( 'button', {
					name: 'Dismiss this notice',
				} )
			).toHaveText( 'The table body must have one or more rows.' );
		} );

		[
			{ type: 'row', selectLabel: 'Select row', deleteLabel: 'Delete row' },
			{ type: 'column', selectLabel: 'Select column', deleteLabel: 'Delete column' },
		].forEach( ( { type, selectLabel, deleteLabel } ) => {
			test( `allows to reach the ${ type } delete button with the keyboard`, async ( {
				editor,
				page,
				fsbUtils,
			} ) => {
				await fsbUtils.createFlexibleTableBlock();
				const selectButton = editor.canvas.getByRole( 'button', { name: selectLabel } ).nth( 1 );
				const deleteButton = page.getByRole( 'button', { name: deleteLabel } );

				// Selecting a row or column with the keyboard does not move focus to the delete button.
				await selectButton.focus();
				await page.keyboard.press( 'Enter' );
				await expect( selectButton ).toHaveAttribute( 'aria-pressed', 'true' );
				await expect( deleteButton ).toBeVisible();
				await expect( selectButton ).toBeFocused();
				await expect( deleteButton ).not.toBeFocused();

				// The delete button can be reached with the Tab key.
				await page.keyboard.press( 'Tab' );
				await expect( deleteButton ).toBeFocused();

				// Shift+Tab moves focus back to the selector.
				await page.keyboard.press( 'Shift+Tab' );
				await expect( selectButton ).toBeFocused();
				await expect( deleteButton ).not.toBeFocused();

				// Escape moves focus back to the selector.
				await page.keyboard.press( 'Tab' );
				await expect( deleteButton ).toBeFocused();
				await page.keyboard.press( 'Escape' );
				await expect( selectButton ).toBeFocused();
				await expect( deleteButton ).not.toBeFocused();
				await expect( deleteButton ).toBeVisible();

				// The delete button can be pressed with the keyboard.
				await page.keyboard.press( 'Tab' );
				await page.keyboard.press( 'Enter' );
				await expect(
					editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } )
				).toHaveCount( 6 );
			} );
		} );
	} );

	test.describe( 'Selecting Cells', () => {
		test( 'disallows to select cells across sections (range select)', async ( {
			editor,
			page,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Header cell text' } ).nth( 0 ).click();
			await page.keyboard.up( 'Shift' );

			await expect(
				page.getByRole( 'button', {
					name: 'Dismiss this notice',
				} )
			).toHaveText( 'Cannot select range cells from difference sections.' );
		} );

		test( 'disallows to select cells across sections (multi select)', async ( {
			page,
			editor,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await page.keyboard.down( 'Control' );
			await editor.canvas.getByRole( 'textbox', { name: 'Header cell text' } ).nth( 0 ).click();
			await page.keyboard.up( 'Control' );
			await expect(
				page.getByRole( 'button', {
					name: 'Dismiss this notice',
				} )
			).toHaveText( 'Cannot select multi cells from difference sections.' );
		} );
	} );

	test.describe( 'Inserting Rows and Columns', () => {
		const insertCases = [
			{
				label: 'Insert row before',
				expected: `<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td>Cell 1</td><td>Cell 2</td><td></td></tr><tr><td>Cell 3</td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`,
			},
			{
				label: 'Insert row after',
				expected: `<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td>Cell 1</td><td>Cell 2</td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td>Cell 3</td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`,
			},
			{
				label: 'Insert column before',
				expected: `<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td>Cell 1</td><td>Cell 2</td><td></td></tr><tr><td></td><td>Cell 3</td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`,
			},
			{
				label: 'Insert column after',
				expected: `<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td>Cell 1</td><td></td><td>Cell 2</td><td></td></tr><tr><td>Cell 3</td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`,
			},
		];

		for ( const { label, expected } of insertCases ) {
			test( `allows to ${ label.toLowerCase() } from the toolbar`, async ( {
				editor,
				page,
				fsbUtils,
			} ) => {
				await fsbUtils.createFlexibleTableBlock();
				const cells = editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } );
				await cells.nth( 0 ).fill( 'Cell 1' );
				await cells.nth( 1 ).fill( 'Cell 2' );
				await cells.nth( 3 ).fill( 'Cell 3' );
				await cells.nth( 0 ).click();
				await editor.clickBlockToolbarButton( 'Edit table' );
				await page.getByRole( 'menuitem', { name: label } ).click();
				expect( await editor.getEditedPostContent() ).toBe( expected );
			} );

			test( `allows to ${ label.toLowerCase() } from the button in the table`, async ( {
				editor,
				fsbUtils,
			} ) => {
				await fsbUtils.createFlexibleTableBlock();
				const cells = editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } );
				await cells.nth( 0 ).fill( 'Cell 1' );
				await cells.nth( 1 ).fill( 'Cell 2' );
				await cells.nth( 3 ).fill( 'Cell 3' );
				await cells.nth( 0 ).click();
				await editor.canvas.getByRole( 'button', { name: label, exact: true } ).first().click();
				expect( await editor.getEditedPostContent() ).toBe( expected );
			} );
		}
	} );

	test.describe( 'Table Justification', () => {
		test( 'allows to change and reset the table justification', async ( {
			editor,
			page,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock();
			await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
			await editor.clickBlockToolbarButton( 'Change table justification' );
			await page.getByRole( 'menuitem', { name: 'Justify table center' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table {"contentJustification":"center"} -->
<figure class="wp-block-flexible-table-block-table is-content-justification-center"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
			await editor.clickBlockToolbarButton( 'Change table justification' );
			await page.getByRole( 'menuitem', { name: 'Justify table right' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table {"contentJustification":"right"} -->
<figure class="wp-block-flexible-table-block-table is-content-justification-right"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
			// Selecting the active justification again resets it.
			await editor.clickBlockToolbarButton( 'Change table justification' );
			await page.getByRole( 'menuitem', { name: 'Justify table right' } ).click();
			expect( await editor.getEditedPostContent() ).toBe(
				`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table -->`
			);
		} );
	} );
} );
