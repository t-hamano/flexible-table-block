/**
 * WordPress dependencies
 */
import {
	insertBlock,
	getEditedPostContent,
	createNewPost,
	pressKeyWithModifier,
	clickBlockToolbarButton,
	clickButton,
} from '@wordpress/e2e-test-utils';

/** @type {import('puppeteer').Page} */
const page = global.page;

const blockSelector = '[data-type="flexible-table-block/table"]';
const cellSelector = `${ blockSelector } td`;

const clickButtonWithLabel = async ( label, index = 0 ) => {
	await page.waitForSelector( `${ blockSelector } [aria-label="${ label }"]` );
	const button = await page.$$( `${ blockSelector } [aria-label="${ label }"]` );
	await button[ index ].click();
};

const createNewTableBlock = async ( { col, row, header = false, footer = false } = {} ) => {
	await insertBlock( 'Flexible' );
	if ( header ) {
		await page.click( '.ftb-placeholder__toggle-header input' );
	}
	if ( footer ) {
		await page.click( '.ftb-placeholder__toggle-footer input' );
	}

	if ( col ) {
		await page.focus( '.ftb-placeholder__column-count input' );
		await pressKeyWithModifier( 'primary', 'a' );
		await page.keyboard.press( 'Delete' );
		await page.keyboard.type( String( col ) );
	}

	if ( row ) {
		await page.focus( '.ftb-placeholder__row-count input' );
		await pressKeyWithModifier( 'primary', 'a' );
		await page.keyboard.press( 'Delete' );
		await page.keyboard.type( String( row ) );
	}

	await page.waitForSelector( '.ftb-placeholder__form button' );
	await page.click( '.ftb-placeholder__form button' );
};

describe( 'Table', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should create block', async () => {
		await createNewTableBlock();
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should create block with option', async () => {
		await createNewTableBlock( { row: 4, col: 4, header: true, footer: true } );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be inserted', async () => {
		await createNewTableBlock();

		const cells = await page.$$( cellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Flexible Table Block' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows cells side by side to be marge', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( cellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 1 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows cells in a vertical line to be marge', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( cellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 5 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows cells to be marge', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( cellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 8 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows merged cells to be split', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		const cells = await page.$$( cellSelector );
		await cells[ 0 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 8 ].click();
		await page.keyboard.up( 'Shift' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );
		const mergedCell = await page.$( cellSelector );
		await mergedCell.click();
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Split Merged Cells' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'disallows merging across sections', async () => {
		await createNewTableBlock( { header: true, footer: true } );
		await clickButtonWithLabel( 'Select column' );
		await clickBlockToolbarButton( 'Edit table' );
		const [ button ] = await page.$x( `//button[contains(text(), 'Merge Cells')]` );
		const disabled = await page.evaluate( ( element ) => element.disabled, button );
		expect( disabled ).toBe( true );
	} );

	it( 'allows all cells side by side to be marge', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		await clickButtonWithLabel( 'Select row' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows all cells in a vertical line to be marge', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		await clickButtonWithLabel( 'Select column' );
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows to delete rows even if they contain merged cells.', async () => {
		await createNewTableBlock( { col: 10, row: 10 } );
		const cells = await page.$$( cellSelector );
		await cells[ 11 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 44 ].click();
		await page.keyboard.up( 'Shift' );

		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		await clickButtonWithLabel( 'Select row', 2 );
		await clickButtonWithLabel( 'Delete row' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows to delete column even if they contain merged cells.', async () => {
		await createNewTableBlock( { col: 10, row: 10 } );
		const cells = await page.$$( cellSelector );
		await cells[ 11 ].click();
		await page.keyboard.down( 'Shift' );
		await cells[ 44 ].click();
		await page.keyboard.up( 'Shift' );

		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		await clickButtonWithLabel( 'Select column', 2 );
		await clickButtonWithLabel( 'Delete column' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
