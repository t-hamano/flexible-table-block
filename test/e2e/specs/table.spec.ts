/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
import FlexibleTableBlockUtils from '../util';

test.use( {
	fsbUtils: async ( { page, editor }, use ) => {
		await use( new FlexibleTableBlockUtils( { page, editor } ) );
	},
} );

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

	test( 'should be inserted', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page
			.locator( 'role=rowgroup >> nth=0 >> role=textbox[name="Body cell text"i] >> nth=0' )
			.click();
		await page.keyboard.type( 'Flexible Table Block' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows cells side by side to be merge', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=1' ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows cells in a vertical line to be merge', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=5' ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows cells to be merge', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=8' ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows merged cells to be split', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=8' ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Split merged cells"i]' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'disallows merging across sections', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await page.locator( 'role=button[name="Select column"i] >> nth=0' ).click();
		await editor.clickBlockToolbarButton( 'Edit table' );
		const mergeButton = page.locator( 'role=menuitem[name="Merge cells"i]' );
		expect( mergeButton ).toBeDisabled();
	} );

	test( 'allows all cells side by side to be merge', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await page.locator( 'role=button[name="Select row"i] >> nth=0' ).click();
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows all cells in a vertical line to be merge', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await page.locator( 'role=button[name="Select column"i] >> nth=2' ).click();
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows to delete rows even if they contain merged cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 10, row: 10 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=11' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=44' ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		await page.locator( 'role=button[name="Select row"i] >> nth=2' ).click();
		await page.locator( 'role=button[name="Delete row"i]' ).click();
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'allows to delete column even if they contain merged cells.', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 10, row: 10 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=11' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=44' ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		await page.locator( 'role=button[name="Select column"i] >> nth=2' ).click();
		await page.locator( 'role=button[name="Delete column"i]' ).click();
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'disallows to select cells across sections', async ( { page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );

		// Test range selection.
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Header cell text"i] >> nth=0' ).click();
		await expect(
			page.locator(
				'role=button[name="Dismiss this notice"i] >> text=Cannot select range cells from difference sections.'
			)
		).toBeVisible();

		// Test multi selection.
		await page.keyboard.up( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.down( 'Control' );
		await page.locator( 'role=textbox[name="Header cell text"i] >> nth=0' ).click();
		await expect(
			page.locator(
				'role=button[name="Dismiss this notice"i] >> text=Cannot select multi cells from difference sections.'
			)
		).toBeVisible();
		await page.keyboard.up( 'Control' );
	} );

	test( 'disallows to delete the only row in the table body', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true, row: 1 } );
		await page.locator( 'role=button[name="Select row"i] >> nth=1' ).click();
		await page.locator( 'role=button[name="Delete row"i]' ).click();
		const snackbar = page.locator(
			'role=button[name="Dismiss this notice"i] >> text=The table body must have one or more rows.'
		);
		await expect( snackbar ).toBeVisible();
		snackbar.click();
		await expect( snackbar ).toBeHidden();
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Delete row"i]' );
		await expect(
			page.locator(
				'role=button[name="Dismiss this notice"i] >> text=The table body must have one or more rows.'
			)
		).toBeVisible();
	} );
} );
