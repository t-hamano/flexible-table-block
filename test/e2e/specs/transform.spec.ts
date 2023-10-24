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
		await page
			.locator( 'role=rowgroup >> nth=0 >> role=textbox[name="Body cell text"i] >> nth=0' )
			.click();
		await page.keyboard.type( 'Core Table Block' );
		await editor.transformBlockTo( 'flexible-table-block/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to flexible table block keeping header & footer section', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createCoreTableBlock();
		await editor.openDocumentSettingsSidebar();
		await page.locator( 'role=checkbox[name="Header section"i]' ).check();
		await page.locator( 'role=checkbox[name="Footer section"i]' ).check();
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
		await page.locator( 'role=checkbox[name="Fixed width table cells"i]' ).check();
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
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 3, row: 6 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=3' ).click();
		await page.keyboard.type( 'Flexible Table Block' );
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no Fixed width table cells option', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 6, row: 3 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.type( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Table settings"i]' );
		await page.locator( 'role=checkbox[name="Fixed width table cells"i]' ).uncheck();
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no style and class table', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 6, row: 3 } );
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Table settings"i]' );
		await page.locator( 'role=checkbox[name="Scroll on desktop view"i]' ).uncheck();
		await page.fill( 'role=spinbutton[name="Table width"i]', '500' );
		await page.fill( '.ftb-padding-control__header-control input', '1' );
		await page.click( 'role=button[name="Solid"i]' );
		await page.click( 'role=button[name="Separate"i]' );
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with rowspan / colspan cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.type( 'Cell 1' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=1' ).click();
		await page.keyboard.type( 'Cell 2' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.down( 'Shift' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=1' ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.click( 'role=menuitem[name="Merge cells"i]' );
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no style and class cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.keyboard.type( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Cell settings"i]' );
		await page.fill( 'role=spinbutton[name="Cell font size"i]', '20' );
		await page.fill( '.ftb-padding-control__header-control input', '1' );
		await page.click( 'role=button[name="Solid"i]' );
		await page.click( 'role=button[name="TH"i]' );
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with no unnecessary attributes cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Cell settings"i]' );
		await page.click( 'role=button[name="TH"i]' );
		await page.fill( 'role=textbox[name="id attribute"i]', 'id' );
		await page.fill( 'role=textbox[name="headers attribute"i]', 'headers' );
		await page.click( 'role=button[name="row"i]' );
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block with appropriate tag cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await page.locator( 'role=textbox[name="Header cell text"i] >> nth=0' ).click();
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Cell settings"i]' );
		await page.click( 'role=button[name="TD"i]' );
		await page.locator( 'role=textbox[name="Body cell text"i] >> nth=0' ).click();
		await page.click( 'role=button[name="TH"i]' );
		await page.locator( 'role=textbox[name="Footer cell text"i] >> nth=0' ).click();
		await page.click( 'role=button[name="TH"i]' );
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
		await page.locator( 'role=document[name="Block: Flexible Table"i] >> figcaption' ).click();
		await page.keyboard.type( 'Flexible' );
		await pageUtils.pressKeys( 'shift+Enter' );
		await page.keyboard.type( 'Table' );
		await pageUtils.pressKeys( 'shift+Enter' );
		await page.keyboard.type( 'Block' );
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should be transformed to core table block width no option caption text', async ( {
		editor,
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await page.locator( 'role=document[name="Block: Flexible Table"i] >> figcaption' ).click();
		await page.keyboard.type( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page.click( 'role=region[name="Editor settings"i] >> role=tab[name="Settings"i]' );
		await page.click( 'role=button[name="Caption settings"i]' );
		await page.fill( 'role=spinbutton[name="Caption font size"i]', '20' );
		await page.fill( '.ftb-padding-control__header-control input', '20' );
		await page.click( 'role=button[name="Top"i]' );
		await editor.transformBlockTo( 'core/table' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
