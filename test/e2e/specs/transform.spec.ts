/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Transform from core table block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should be transformed to flexible table block with no Fixed width table cells option', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createCoreTableBlock();
		await fsbUtils.getBodyCell( 0 ).fill( 'Core Table Block' );
		await page.getByRole( 'checkbox', { name: 'Fixed width table cells' } ).uncheck();
		await editor.transformBlockTo( 'flexible-table-block/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to flexible table block keeping header and footer section', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createCoreTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page.getByRole( 'checkbox', { name: 'Header section' } ).check();
		await page.getByRole( 'checkbox', { name: 'Footer section' } ).check();
		await page.getByRole( 'checkbox', { name: 'Fixed width table cells' } ).uncheck();
		await editor.transformBlockTo( 'flexible-table-block/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to flexible table block keeping Fixed width table cells option', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createCoreTableBlock( { col: 6, row: 6 } );
		await editor.openDocumentSettingsSidebar();
		await page.getByRole( 'checkbox', { name: 'Fixed width table cells' } ).check();
		await editor.transformBlockTo( 'flexible-table-block/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );

test.describe( 'Transform from flexible table block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should be transformed to core table block keeping Fixed width table cells option', async ( {
		editor,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 3, row: 6 } );
		await fsbUtils.getBodyCell( 3 ).fill( 'Flexible Table Block' );
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no Fixed width table cells option', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 6, row: 3 } );
		await fsbUtils.getBodyCell( 0 ).fill( 'Flexible Table Block' );
		await fsbUtils.openBlockSidebar( { panel: 'Table settings' } );
		await page.getByRole( 'switch', { name: 'Fixed width table cells' } ).uncheck();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no style and class table', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 6, row: 3 } );
		await fsbUtils.openBlockSidebar( { panel: 'Table settings' } );
		await page.getByRole( 'switch', { name: 'Scroll on desktop view' } ).uncheck();
		await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '500' );
		await page
			.getByRole( 'group', { name: 'Table padding' } )
			.getByRole( 'spinbutton', { name: 'All' } )
			.fill( '1' );
		await page.getByRole( 'button', { name: 'Solid' } ).click();
		await page.getByRole( 'button', { name: 'Separate' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with rowspan / colspan cells', async ( {
		editor,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await fsbUtils.getBodyCell( 0 ).fill( 'Cell 1' );
		await fsbUtils.getBodyCell( 1 ).fill( 'Cell 2' );
		await fsbUtils.mergeBodyCells( 0, 1 );
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no style and class cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.getBodyCell( 0 ).fill( 'Flexible Table Block' );
		await fsbUtils.openBlockSidebar( { panel: 'Cell settings' } );
		await page.getByRole( 'spinbutton', { name: 'Cell font size' } ).fill( '20' );
		await page
			.getByRole( 'group', { name: 'Cell padding' } )
			.getByRole( 'spinbutton', { name: 'All' } )
			.fill( '1' );
		await page.getByRole( 'button', { name: 'Solid' } ).click();
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no unnecessary attributes cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.getBodyCell( 0 ).click();
		await fsbUtils.openBlockSidebar( { panel: 'Cell settings' } );
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await page.getByRole( 'textbox', { name: 'id attribute' } ).fill( 'id' );
		await page.getByRole( 'textbox', { name: 'headers attribute' } ).fill( 'headers' );
		await page.getByRole( 'combobox', { name: 'scope attribute' } ).selectOption( 'row' );
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with appropriate tag cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await editor.canvas.getByRole( 'textbox', { name: 'Header cell text' } ).nth( 0 ).click();
		await fsbUtils.openBlockSidebar( { panel: 'Cell settings' } );
		await page.getByRole( 'radio', { name: 'TD' } ).click();
		await fsbUtils.getBodyCell( 0 ).click();
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await editor.canvas.getByRole( 'textbox', { name: 'Footer cell text' } ).nth( 0 ).click();
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block keeping caption text', async ( {
		editor,
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.clickBlockToolbarButton( 'Add caption' );
		await editor.canvas.getByRole( 'textbox', { name: 'Table caption text' } ).click();
		await page.keyboard.type( 'Flexible' );
		await pageUtils.pressKeys( 'shift+Enter' );
		await page.keyboard.type( 'Table' );
		await pageUtils.pressKeys( 'shift+Enter' );
		await page.keyboard.type( 'Block' );
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no option caption text', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.clickBlockToolbarButton( 'Add caption' );
		await editor.canvas
			.getByRole( 'textbox', { name: 'Table caption text' } )
			.fill( 'Flexible Table Block' );
		await fsbUtils.openBlockSidebar( { panel: 'Caption settings' } );
		await page.getByRole( 'spinbutton', { name: 'Caption font size' } ).fill( '20' );
		await page
			.getByRole( 'group', { name: 'Caption padding' } )
			.getByRole( 'spinbutton', { name: 'All' } )
			.fill( '1' );
		await page.getByRole( 'radio', { name: 'Top' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
