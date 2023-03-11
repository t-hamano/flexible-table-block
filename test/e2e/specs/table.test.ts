/**
 * WordPress dependencies
 */
import {
	getEditedPostContent,
	createNewPost,
	clickBlockToolbarButton,
	clickButton,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	flexibleTableSelector,
	flexibleTableCellSelector,
	createNewFlexibleTableBlock,
	clickButtonWithAriaLabel,
	clickButtonWithText,
	clickToggleControlWithText,
	openSidebar,
	getWpVersion,
} from '../helper';

/** @type {import('puppeteer').Page} */
const page = global.page;

describe( 'Flexible table', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should create block', async () => {
		await createNewFlexibleTableBlock();
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should create block with option', async () => {
		await createNewFlexibleTableBlock( { row: 4, col: 4, header: true, footer: true } );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be inserted', async () => {
		await createNewFlexibleTableBlock();
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Flexible Table Block' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows cells side by side to be merge', async () => {
		await createNewFlexibleTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 1 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows cells in a vertical line to be merge', async () => {
		await createNewFlexibleTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 5 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows cells to be merge', async () => {
		await createNewFlexibleTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 8 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows merged cells to be split', async () => {
		await createNewFlexibleTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 8 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		const mergedCell = await page.$( flexibleTableCellSelector );
		await mergedCell.click();
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Split Merged Cells' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'disallows merging across sections', async () => {
		await createNewFlexibleTableBlock( { header: true, footer: true } );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Select column', 2 );
		await clickBlockToolbarButton( 'Edit table' );
		const [ button ] = await page.$x( `//button[contains(text(), 'Merge Cells')]` );
		const disabled = await page.evaluate( ( element ) => element.disabled, button );
		expect( disabled ).toBe( true );
	} );

	it( 'allows all cells side by side to be merge', async () => {
		await createNewFlexibleTableBlock( { col: 5, row: 5 } );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Select row' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows all cells in a vertical line to be merge', async () => {
		await createNewFlexibleTableBlock( { col: 5, row: 5 } );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Select column', 2 );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows to delete rows even if they contain merged cells.', async () => {
		await createNewFlexibleTableBlock( { col: 10, row: 10 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 11 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 44 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Select row', 2 );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Delete row' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows to delete column even if they contain merged cells.', async () => {
		await createNewFlexibleTableBlock( { col: 10, row: 10 } );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 11 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 44 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Select column', 2 );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Delete column' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should move cells with the TAB key.', async () => {
		const wpVersion = await getWpVersion();
		await createNewFlexibleTableBlock();
		await openSidebar();
		await clickButton( 'Global Setting' );
		await clickButton( 'Editor Options' );
		await clickToggleControlWithText( 'Use the tab key to move cells' );
		await clickButtonWithText(
			'//div[@class="ftb-global-setting-modal__buttons"]',
			'Save Setting'
		);
		await page.waitForSelector( '.ftb-global-setting-modal__notice' );
		const modalCloseLabel = [ '6-2', '6-3' ].includes( wpVersion ) ? 'Close' : 'Close dialog';
		await clickButtonWithAriaLabel( '.ftb-global-setting-modal', modalCloseLabel );
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Cell 1' );
		await page.keyboard.down( 'Tab' );
		await page.keyboard.up( 'Tab' );
		await page.keyboard.down( 'Tab' );
		await page.keyboard.up( 'Tab' );
		await page.keyboard.down( 'Shift' );
		await page.keyboard.down( 'Tab' );
		await page.keyboard.up( 'Tab' );
		await page.keyboard.up( 'Shift' );
		await page.keyboard.type( 'Cell 2' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
