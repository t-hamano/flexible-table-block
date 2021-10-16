/**
 * WordPress dependencies
 */
import { insertBlock, getEditedPostContent, createNewPost } from '@wordpress/e2e-test-utils';

describe( 'Table', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should create block', async () => {
		await insertBlock( 'Flexible' );
		await page.waitForSelector( '.ftb-placeholder__form button' );
		await page.click( '.ftb-placeholder__form button' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should be inserted', async () => {
		await insertBlock( 'Flexible' );
		const createTableSelector = '.ftb-placeholder__form button';
		await page.waitForSelector( createTableSelector );
		await page.click( createTableSelector );
		const cellSelector =
			'[data-type="flexible-table-block/table"] .block-editor-rich-text__editable';
		await page.waitForSelector( cellSelector );
		await page.click( cellSelector );
		await page.keyboard.type( 'Flexible Table Block' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
