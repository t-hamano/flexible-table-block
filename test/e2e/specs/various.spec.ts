/**
 * Internal dependencies
 */
import { test, expect } from '../util';

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
		await editor.canvas.getByRole( 'button', { name: 'Create Table' } ).click();
		await expect(
			page
				.getByRole( 'region', { name: 'Editor settings' } )
				.getByRole( 'button', { name: 'Flexible Table' } )
		).toBeVisible();
	} );

	test( 'contentOnly mode should hide structural controls and keep cells editable', async ( {
		editor,
		page,
	} ) => {
		await editor.insertBlock( {
			name: 'core/group',
			attributes: {
				templateLock: 'contentOnly',
			},
			innerBlocks: [ { name: 'flexible-table-block/table' } ],
		} );
		await editor.canvas.getByRole( 'button', { name: 'Create Table' } ).click();
		await editor.canvas
			.getByRole( 'textbox', { name: 'Body cell text' } )
			.nth( 0 )
			.fill( 'Flexible Table Block' );

		// Structural controls in the block toolbar are hidden.
		const blockToolbar = page.getByRole( 'toolbar', { name: 'Block tools' } );
		await expect( blockToolbar ).toBeVisible();
		await expect( blockToolbar.getByRole( 'button', { name: 'Edit table' } ) ).toHaveCount( 0 );
		await expect(
			blockToolbar.getByRole( 'button', { name: 'Change table justification' } )
		).toHaveCount( 0 );

		// Structural controls in the table are hidden.
		for ( const name of [ 'tbody', 'Select row', 'Select column', 'Insert row before' ] ) {
			await expect( editor.canvas.getByRole( 'button', { name, exact: true } ) ).toHaveCount( 0 );
		}

		// Cell content is still editable.
		expect( await editor.getEditedPostContent() ).toBe(
			`<!-- wp:group {"templateLock":"contentOnly"} -->
<div class="wp-block-group"><!-- wp:flexible-table-block/table -->
<figure class="wp-block-flexible-table-block-table"><table class="has-fixed-layout"><tbody><tr><td>Flexible Table Block</td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody></table></figure>
<!-- /wp:flexible-table-block/table --></div>
<!-- /wp:group -->`
		);
	} );
} );
