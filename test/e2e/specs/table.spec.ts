/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Flexible table', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should create block', async ( { editor, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should create block with option', async ( { editor, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { row: 4, col: 4, header: true, footer: true } );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be inserted', async ( { editor, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.getBodyCell( 0 ).fill( 'Flexible Table Block' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test.describe( 'Merging and Splitting Cells', () => {
		test( 'allows cells side by side to be merge', async ( { editor, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await fsbUtils.mergeBodyCells( 0, 1 );
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
		} );

		test( 'allows cells in a vertical line to be merge', async ( { editor, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await fsbUtils.mergeBodyCells( 0, 5 );
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
		} );

		test( 'allows cells to be merge', async ( { editor, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await fsbUtils.mergeBodyCells( 0, 8 );
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
		} );

		test( 'allows merged cells to be split', async ( { editor, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await fsbUtils.mergeBodyCells( 0, 8 );
			await fsbUtils.getBodyCell( 0 ).click();
			await fsbUtils.clickEditTableMenuItem( 'Split merged cells' );
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
		} );

		test( 'disallows merging across sections', async ( { editor, page, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
			await editor.canvas.getByRole( 'button', { name: 'Select column' } ).nth( 0 ).click();
			await editor.clickBlockToolbarButton( 'Edit table' );
			const mergeButton = page.getByRole( 'menuitem', { name: 'Merge cells' } );
			await expect( mergeButton ).toBeDisabled();
		} );

		test( 'allows all cells side by side to be merge', async ( { editor, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await editor.canvas.getByRole( 'button', { name: 'Select row' } ).nth( 0 ).click();
			await fsbUtils.clickEditTableMenuItem( 'Merge cells' );
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
		} );

		test( 'allows all cells in a vertical line to be merge', async ( { editor, fsbUtils } ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
			await editor.canvas.getByRole( 'button', { name: 'Select column' } ).nth( 2 ).click();
			await fsbUtils.clickEditTableMenuItem( 'Merge cells' );
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
		} );
	} );

	test.describe( 'Deleting Rows and Columns', () => {
		test( 'allows to delete rows even if they contain merged cells', async ( {
			editor,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 10, row: 10 } );
			await fsbUtils.mergeBodyCells( 11, 44 );
			const selectRowButton = editor.canvas.getByRole( 'button', { name: 'Select row' } ).nth( 2 );
			await expect( selectRowButton ).toHaveAttribute( 'aria-pressed', 'false' );
			await selectRowButton.click();
			await expect( selectRowButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await editor.canvas.getByRole( 'button', { name: 'Delete row' } ).click();
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
		} );

		test( 'allows to delete column even if they contain merged cells.', async ( {
			editor,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { col: 10, row: 10 } );
			await fsbUtils.mergeBodyCells( 11, 44 );
			const selectColumnButton = editor.canvas
				.getByRole( 'button', { name: 'Select column' } )
				.nth( 2 );
			await expect( selectColumnButton ).toHaveAttribute( 'aria-pressed', 'false' );
			await selectColumnButton.click();
			await expect( selectColumnButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await editor.canvas.getByRole( 'button', { name: 'Delete column' } ).click();
			expect( await editor.getEditedPostContent() ).toMatchSnapshot();
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
			await editor.canvas.getByRole( 'button', { name: 'Delete row' } ).click();
			const snackbar = page.getByRole( 'button', {
				name: 'Dismiss this notice',
			} );
			await expect( snackbar ).toHaveText( 'The table body must have one or more rows.' );
			await snackbar.click();
			await expect( snackbar ).toBeHidden();
			await fsbUtils.getBodyCell( 0 ).click();
			await fsbUtils.clickEditTableMenuItem( 'Delete row' );
			await expect(
				page.getByRole( 'button', {
					name: 'Dismiss this notice',
				} )
			).toHaveText( 'The table body must have one or more rows.' );
		} );
	} );

	test.describe( 'Selecting Cells', () => {
		test( 'disallows to select cells across sections (range select)', async ( {
			editor,
			page,
			fsbUtils,
		} ) => {
			await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
			await fsbUtils.getBodyCell( 0 ).click();
			await page.keyboard.down( 'Shift' );
			await editor.canvas.getByRole( 'textbox', { name: 'Header cell text' } ).nth( 0 ).click();

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
			await fsbUtils.getBodyCell( 0 ).click();
			await page.keyboard.down( 'Control' );
			await editor.canvas.getByRole( 'textbox', { name: 'Header cell text' } ).nth( 0 ).click();
			await expect(
				page.getByRole( 'button', {
					name: 'Dismiss this notice',
				} )
			).toHaveText( 'Cannot select multi cells from difference sections.' );
		} );
	} );
} );
