/**
 * WordPress dependencies
 */
import { getEditedPostContent, createNewPost, transformBlockTo } from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	createNewFlexibleTableBlock,
	createNewCoreTableBlock,
	coreTableCellSelector,
	flexibleTableCellSelector,
	clickToggleControlWithText,
	openSidebar,
	openSidebarPanelWithTitle,
} from '../helper';

describe( 'Transform from core table block to flexible table block', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should be transformed to flexible table block with no "Fixed width table cells" option', async () => {
		await createNewCoreTableBlock();
		const cells = await page.$$( coreTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Core Table Block' );
		await transformBlockTo( 'Flexible Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to flexible table block heeping header & footer section', async () => {
		await createNewCoreTableBlock();
		await openSidebar();
		await openSidebarPanelWithTitle( 'Table settings' );
		await clickToggleControlWithText( 'Header section' );
		await clickToggleControlWithText( 'Footer section' );
		await transformBlockTo( 'Flexible Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to flexible table block keeping "Fixed width table cells" option', async () => {
		await createNewCoreTableBlock( { col: 6, row: 6 } );
		await openSidebar();
		await openSidebarPanelWithTitle( 'Table settings' );
		await clickToggleControlWithText( 'Fixed width table cells' );
		await transformBlockTo( 'Flexible Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );

describe( 'Transform from flexible table block to core table block', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should be transformed to core table block keeping "Fixed width table cells" option', async () => {
		await createNewFlexibleTableBlock( { col: 3, row: 6 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Flexible Table Block' );
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to core table block with no "Fixed width table cells" option', async () => {
		await createNewFlexibleTableBlock( { col: 6, row: 3 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Flexible Table Block' );
		await openSidebar();
		await openSidebarPanelWithTitle( 'Table Settings' );
		await clickToggleControlWithText( 'Fixed width table cells' );
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	/* eslint-disable jest/no-commented-out-tests */
	// it( 'should be transformed to core table block with no style & classes table', async () => {
	// 	await createNewFlexibleTableBlock( { col: 6, row: 3 } );
	// 	await openSidebar();
	// 	await openSidebarPanelWithTitle( 'Table Settings' );
	// 	await clickToggleControlWithText( 'Scroll on PC view' );
	// 	await clickToggleControlWithText( 'Scroll on Mobile view' );
	// 	await clickToggleControlWithText( 'Stack on mobile' );
	// 	await selectOptionFromLabel( 'Fixed control', 'header' );
	// 	await inputValueFromLabel( 'Table Width', '500px' );
	// 	await transformBlockTo( 'Table' );
	// 	expect( await getEditedPostContent() ).toMatchSnapshot();
	// } );

	// 	it( 'should be transformed to core table block with no rowspan / colspan cells', async () => {
	// 		// 結合セル、未結合セルそれぞれにテキストを入れる
	// 	} );

	// 	it( 'should be transformed to core table block keeping caption text', async () => {
	// 		// 改行入りのテキストをテストする
	// 	} );

	// 	it( 'should be transformed to core table block width no inline-style cells', async () => {} );

	// 	it( 'should be transformed to core table block width no classes cells', async () => {} );

	// it( 'should be transformed to core table block width no inline-style caption text', async () => {} );
} );
