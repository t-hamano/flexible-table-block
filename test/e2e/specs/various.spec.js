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

test.describe( 'Various', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'contentOnly mode should be enabled', async ( { editor, page } ) => {
		await editor.insertBlock( {
			name: 'core/group',
			attributes: {
				templateLock: 'contentOnly',
			},
			innerBlocks: [ { name: 'flexible-table-block/table' } ],
		} );
		await page.getByRole( 'button', { name: 'Create Table' } ).click();
		await expect(
			page
				.getByRole( 'region', { name: 'Editor settings' } )
				.getByRole( 'button', { name: 'Flexible Table' } )
		).toBeVisible();
	} );
} );
