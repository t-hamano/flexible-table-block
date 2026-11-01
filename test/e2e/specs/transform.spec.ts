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
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 0 )
			.fill( 'Core Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page.getByRole( 'checkbox', { name: 'Fixed width table cells' } ).uncheck();
		await editor.transformBlockTo( 'flexible-table-block/table' );

		const content = await editor.getEditedPostContent();
		expect( content ).toContain(
			'<!-- wp:flexible-table-block/table {"hasFixedLayout":false} -->'
		);
		expect( content ).toContain( '<table class=""><tbody><tr><td>Core Table Block</td>' );
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

		const content = await editor.getEditedPostContent();
		expect( content ).toContain( '<!-- wp:flexible-table-block/table' );
		expect( content ).toContain( '<thead><tr><th></th><th></th></tr></thead>' );
		expect( content ).toContain( '<tfoot><tr><td></td><td></td></tr></tfoot>' );
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

		const content = await editor.getEditedPostContent();
		expect( content ).toContain( '<!-- wp:flexible-table-block/table -->' );
		expect( content ).toContain( '<table class="has-fixed-layout">' );
	} );

	test( 'should be transformed to flexible table block keeping merged cells and caption', async ( {
		editor,
	} ) => {
		await editor.insertBlock( {
			name: 'core/table',
			attributes: {
				head: [
					{
						cells: [
							{ content: 'Header 1', tag: 'th', colspan: '2' },
							{ content: 'Header 3', tag: 'th' },
						],
					},
				],
				body: [
					{
						cells: [
							{ content: 'Cell 1', tag: 'td', rowspan: '2' },
							{ content: 'Cell 2', tag: 'td' },
							{ content: 'Cell 3', tag: 'td' },
						],
					},
					{
						cells: [
							{ content: 'Cell 4', tag: 'td' },
							{ content: 'Cell 5', tag: 'td' },
						],
					},
				],
				caption: 'Table <strong>caption</strong>',
			},
		} );
		await editor.transformBlockTo( 'flexible-table-block/table' );

		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><thead><tr><th colspan="2">Header 1</th><th>Header 3</th></tr></thead><tbody><tr><td rowspan="2">Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr><tr><td>Cell 4</td><td>Cell 5</td></tr></tbody></table><figcaption>Table <strong>caption</strong></figcaption></figure>
<!-- /wp:flexible-table-block/table -->`
		);
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
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 3 )
			.fill( 'Flexible Table Block' );
		await editor.transformBlockTo( 'core/table' );

		const content = await editor.getEditedPostContent();
		expect( content ).toContain( '<!-- wp:table -->' );
		expect( content ).toContain( '<table class="has-fixed-layout">' );
	} );

	test( 'should be transformed to core table block with no Fixed width table cells option', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 6, row: 3 } );
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 0 )
			.fill( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Table settings' } ).click();
		await page.getByRole( 'switch', { name: 'Fixed width table cells' } ).uncheck();
		await editor.transformBlockTo( 'core/table' );

		const content = await editor.getEditedPostContent();
		expect( content ).toContain( '<!-- wp:table {"hasFixedLayout":false} -->' );
		expect( content ).toContain( '<table><tbody><tr><td>Flexible Table Block</td>' );
	} );

	test( 'should be transformed to core table block with no style and class table', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 6, row: 3 } );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Table settings' } ).click();
		await page.getByRole( 'switch', { name: 'Scroll on desktop view' } ).uncheck();
		await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '500' );
		await page
			.getByRole( 'group', { name: 'Table padding' } )
			.getByRole( 'spinbutton', { name: 'All' } )
			.fill( '1' );
		await page.getByRole( 'button', { name: 'Solid' } ).click();
		await page.getByRole( 'button', { name: 'Separate' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:table -->`
		);
	} );

	test( 'should be transformed to core table block with rowspan / colspan cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { col: 5, row: 5 } );
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 0 )
			.fill( 'Cell 1' );
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 1 )
			.fill( 'Cell 2' );
		await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
		await page.keyboard.down( 'Shift' );
		await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 1 ).click();
		await page.keyboard.up( 'Shift' );
		await editor.clickBlockToolbarButton( 'Edit table' );
		await page.getByRole( 'menuitem', { name: 'Merge cells' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td colspan="2">Cell 1</td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:table -->`
		);
	} );

	test( 'should be transformed to core table block with no style and class cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 0 )
			.fill( 'Flexible Table Block' );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Cell settings' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Cell font size' } ).fill( '20' );
		await page
			.getByRole( 'group', { name: 'Cell padding' } )
			.getByRole( 'spinbutton', { name: 'All' } )
			.fill( '1' );
		await page.getByRole( 'button', { name: 'Solid' } ).click();
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>Flexible Table Block</td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:table -->`
		);
	} );

	test( 'should be transformed to core table block with no unnecessary attributes cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Cell settings' } ).click();
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await page.getByRole( 'textbox', { name: 'id attribute' } ).fill( 'id' );
		await page.getByRole( 'textbox', { name: 'headers attribute' } ).fill( 'headers' );
		await page.getByRole( 'combobox', { name: 'scope attribute' } ).click();
		await page.getByRole( 'option', { name: 'row', exact: true } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:table -->`
		);
	} );

	test( 'should be transformed to core table block with appropriate tag cells', async ( {
		editor,
		page,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await editor.canvas.getByRole( 'textbox', { name: 'Header cell text' } ).nth( 0 ).click();
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Cell settings' } ).click();
		await page.getByRole( 'radio', { name: 'TD' } ).click();
		await editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( 0 ).click();
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await editor.canvas.getByRole( 'textbox', { name: 'Footer cell text' } ).nth( 0 ).click();
		await page.getByRole( 'radio', { name: 'TH' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th></th><th></th><th></th></tr></thead><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody><tfoot><tr><td></td><td></td><td></td></tr></tfoot></table></figure>
<!-- /wp:table -->`
		);
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

		const content = await editor.getEditedPostContent();
		expect( content ).toContain( '<!-- wp:table -->' );
		expect( content ).toContain(
			'<figcaption class="wp-element-caption">Flexible<br>Table<br>Block</figcaption>'
		);
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
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: 'Settings' } )
			.click();
		await page.getByRole( 'button', { name: 'Caption settings', exact: true } ).click();
		await page.getByRole( 'spinbutton', { name: 'Caption font size' } ).fill( '20' );
		await page
			.getByRole( 'group', { name: 'Caption padding' } )
			.getByRole( 'spinbutton', { name: 'All' } )
			.fill( '1' );
		await page.getByRole( 'radio', { name: 'Top' } ).click();
		await editor.transformBlockTo( 'core/table' );

		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:table -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table><figcaption class="wp-element-caption">Flexible Table Block</figcaption></figure>
<!-- /wp:table -->`
		);
	} );
} );
