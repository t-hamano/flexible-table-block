/**
 * WordPress dependencies
 */
import {
	getEditedPostContent,
	createNewPost,
	transformBlockTo,
	clickBlockToolbarButton,
	clickButton,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	createNewFlexibleTableBlock,
	createNewCoreTableBlock,
	coreTableCellSelector,
	flexibleTableCellSelector,
	flexibleTableCaptionSelector,
	clickButtonWithAriaLabel,
	clickButtonWithText,
	inputValueFromLabel,
	inputValueFromLabelledBy,
	clickToggleControlWithText,
	openSidebar,
	openSidebarPanelWithTitle,
} from '../helper';

/** @type {import('puppeteer').Page} */
const page = global.page;

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
		await cells[ 3 ].click();
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

	it( 'should be transformed to core table block with no style & class table', async () => {
		await createNewFlexibleTableBlock( { col: 6, row: 3 } );
		await openSidebar();
		await openSidebarPanelWithTitle( 'Table Settings' );
		await clickToggleControlWithText( 'Scroll on PC view' );
		await inputValueFromLabel( 'Table Width', '500px' );
		await inputValueFromLabelledBy( 'flexible-table-block-table-padding-heading', '1px' );
		await clickButtonWithAriaLabel(
			'[aria-labelledby="flexible-table-block-table-border-style-heading"]',
			'Solid'
		);
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-table-border-collapse"]',
			'Share'
		);
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to core table block with no rowspan / colspan cells', async () => {
		await createNewFlexibleTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Cell 1' );
		await cells[ 1 ].click();
		await page.keyboard.type( 'Cell 2' );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 1 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to core table block with no style & class cells', async () => {
		await createNewFlexibleTableBlock();
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Flexible Table Block' );
		await openSidebar();
		await openSidebarPanelWithTitle( 'Cell Settings' );
		await inputValueFromLabel( 'Cell Font Size', '20px' );
		await inputValueFromLabelledBy( 'flexible-table-block-cell-padding-heading', '1px' );
		await clickButtonWithAriaLabel(
			'[aria-labelledby="flexible-table-block-cell-border-style-heading"]',
			'Solid'
		);
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-cell-tag-heading"]',
			'TH'
		);
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to core table block with no unnecessary attributes cells', async () => {
		await createNewFlexibleTableBlock();
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await openSidebar();
		await openSidebarPanelWithTitle( 'Cell Settings' );
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-cell-tag-heading"]',
			'TH'
		);
		await inputValueFromLabel( 'id attribute', 'id' );
		await inputValueFromLabel( 'headers attribute', 'headers' );
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-cell-scope-heading"]',
			'row'
		);
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to core table block with appropriate tag cells', async () => {
		await createNewFlexibleTableBlock( { header: true, footer: true } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await openSidebar();
		await openSidebarPanelWithTitle( 'Cell Settings' );
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-cell-tag-heading"]',
			'TD'
		);
		await cells[ 3 ].click();
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-cell-tag-heading"]',
			'TH'
		);
		await cells[ 12 ].click();
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-cell-tag-heading"]',
			'TH'
		);
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to core table block keeping caption text', async () => {
		await createNewFlexibleTableBlock();
		await page.$$( flexibleTableCaptionSelector );
		await page.focus( flexibleTableCaptionSelector );
		await page.keyboard.type( 'Flexible' );
		await page.keyboard.down( 'Shift' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.up( 'Shift' );
		await page.keyboard.type( 'Table' );
		await page.keyboard.down( 'Shift' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.up( 'Shift' );
		await page.keyboard.type( 'Block' );
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be transformed to core table block width no option caption text', async () => {
		await createNewFlexibleTableBlock();
		await page.$$( flexibleTableCaptionSelector );
		await page.focus( flexibleTableCaptionSelector );
		await page.keyboard.type( 'Flexible Table Block' );
		await openSidebar();
		await openSidebarPanelWithTitle( 'Caption Settings' );
		await inputValueFromLabel( 'Caption Font Size', '20px' );
		await inputValueFromLabelledBy( 'flexible-table-block-caption-padding-heading', '20px' );
		await clickButtonWithText( '//*[@aria-labelledby="flexible-table-block-caption-side"]', 'Top' );
		await transformBlockTo( 'Table' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
