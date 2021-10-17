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

const cellSelector = '[data-type="flexible-table-block/table"] td';

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

	it( 'allows all cells side by side to be marge', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		const selectRow = await page.$( '[aria-label="Select row"]' );
		await selectRow.click();
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'allows all cells in a vertical line to be marge', async () => {
		await createNewTableBlock( { col: 5, row: 5 } );
		const selectColumn = await page.$( '[aria-label="Select column"]' );
		await selectColumn.click();
		await clickBlockToolbarButton( 'Edit table' );
		await clickButton( 'Merge Cells' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
