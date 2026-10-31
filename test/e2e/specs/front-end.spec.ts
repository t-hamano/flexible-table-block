/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import type { Editor } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { test, expect } from '../util';

const BLOCK_CLASS = 'wp-block-flexible-table-block-table';
const INLINE_CSS_SELECTOR = 'style#flexible-table-block-table-view-style-inline-css';

// A table with a header row and two body rows.
const TABLE_ATTRIBUTES = {
	head: [
		{
			cells: [
				{ content: 'Header 1', tag: 'th' },
				{ content: 'Header 2', tag: 'th' },
			],
		},
	],
	body: [
		{ cells: [ { content: 'Cell 1' }, { content: 'Cell 2' } ] },
		{ cells: [ { content: 'Cell 3' }, { content: 'Cell 4' } ] },
	],
};

/**
 * Publishes the current post and visits it on the front end.
 *
 * @param {Object} root0        Fixtures.
 * @param {Editor} root0.editor Editor utils.
 * @param {Page}   root0.page   Page.
 */
async function visitPublishedPost( { editor, page }: { editor: Editor; page: Page } ) {
	const postId = await editor.publishPost();
	await page.goto( `/?p=${ postId }` );
}

test.describe( 'Front end', () => {
	test.afterEach( async ( { requestUtils } ) => {
		// Restore the default settings.
		await requestUtils.rest( {
			method: 'DELETE',
			path: '/flexible-table-block/v1/options',
		} );
		await requestUtils.deleteAllPosts();
	} );

	test( 'should output block CSS reflecting the global settings', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		await requestUtils.rest( {
			method: 'POST',
			path: '/flexible-table-block/v1/options',
			data: {
				block_style: {
					table_width: '90%',
					table_max_width: '110%',
					table_border_collapse: 'separate',
					row_odd_color: '#111111',
					row_even_color: '#222222',
					cell_text_color_th: '#333333',
					cell_text_color_td: '#444444',
					cell_background_color_th: '#555555',
					cell_background_color_td: '#666666',
					cell_padding: { top: '1em', right: '2em', bottom: '3em', left: '4em' },
					cell_border_width: '2px',
					cell_border_style: 'dotted',
					cell_border_color: '#777777',
					cell_text_align: 'center',
					cell_vertical_align: 'bottom',
				},
			},
		} );
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: TABLE_ATTRIBUTES,
		} );
		await visitPublishedPost( { editor, page } );

		const selector = `.${ BLOCK_CLASS }.${ BLOCK_CLASS }`;
		const expectedRules = [
			`${ selector }>table{width:90%;max-width:110%;border-collapse:separate;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(odd) th{background-color:#111111;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(odd) td{background-color:#111111;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(even) th{background-color:#222222;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(even) td{background-color:#222222;}`,
			`${ selector }>table tr th,${ selector }>table tr td{padding:1em 2em 3em 4em;border-width:2px;border-style:dotted;border-color:#777777;text-align:center;vertical-align:bottom;}`,
			`${ selector }>table tr th{color:#333333;background-color:#555555;}`,
			`${ selector }>table tr td{color:#444444;background-color:#666666;}`,
		];
		const inlineCss = await page.locator( INLINE_CSS_SELECTOR ).textContent();
		expect( inlineCss ).toContain( expectedRules.join( '' ) );

		// The CSS should actually be applied to the block.
		const table = page.locator( `.${ BLOCK_CLASS } > table` );
		await expect( table ).toHaveCSS( 'border-collapse', 'separate' );
		const th = table.locator( 'th' ).first();
		await expect( th ).toHaveCSS( 'color', 'rgb(51, 51, 51)' );
		await expect( th ).toHaveCSS( 'background-color', 'rgb(85, 85, 85)' );
		const td = table.locator( 'td' ).first();
		await expect( td ).toHaveCSS( 'color', 'rgb(68, 68, 68)' );
		await expect( td ).toHaveCSS( 'background-color', 'rgb(102, 102, 102)' );
		await expect( td ).toHaveCSS( 'border-top-style', 'dotted' );
		await expect( td ).toHaveCSS( 'border-top-color', 'rgb(119, 119, 119)' );
		await expect( td ).toHaveCSS( 'text-align', 'center' );
		await expect( td ).toHaveCSS( 'vertical-align', 'bottom' );
	} );

	test( 'should output responsive CSS reflecting the breakpoint option', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		await requestUtils.rest( {
			method: 'POST',
			path: '/flexible-table-block/v1/options',
			data: { breakpoint: 600 },
		} );
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: { ...TABLE_ATTRIBUTES, isScrollOnPc: true },
		} );
		await editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: { ...TABLE_ATTRIBUTES, isScrollOnMobile: true },
		} );
		await editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: { ...TABLE_ATTRIBUTES, isStackedOnMobile: true },
		} );
		await visitPublishedPost( { editor, page } );

		const inlineCss = await page.locator( INLINE_CSS_SELECTOR ).textContent();
		expect( inlineCss ).toContain( '@media screen and (min-width:601px){' );
		expect( inlineCss ).toContain( '@media screen and (max-width:600px){' );

		const scrollOnPc = page.locator( `.${ BLOCK_CLASS }.is-scroll-on-pc` );
		const scrollOnMobile = page.locator( `.${ BLOCK_CLASS }.is-scroll-on-mobile` );
		const stackedCell = page.locator( `.${ BLOCK_CLASS } table.is-stacked-on-mobile td` ).first();

		// Wider than the breakpoint, but narrower than the default breakpoint (768px).
		await page.setViewportSize( { width: 700, height: 800 } );
		await expect( scrollOnPc ).toHaveCSS( 'overflow-x', 'scroll' );
		await expect( scrollOnMobile ).not.toHaveCSS( 'overflow-x', 'scroll' );
		await expect( stackedCell ).toHaveCSS( 'display', 'table-cell' );

		// Narrower than the breakpoint.
		await page.setViewportSize( { width: 500, height: 800 } );
		await expect( scrollOnPc ).not.toHaveCSS( 'overflow-x', 'scroll' );
		await expect( scrollOnMobile ).toHaveCSS( 'overflow-x', 'scroll' );
		await expect( stackedCell ).toHaveCSS( 'display', 'block' );
	} );

	test( 'should make the header and the first column sticky', async ( { admin, editor, page } ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: { ...TABLE_ATTRIBUTES, sticky: 'header' },
		} );
		await editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: { ...TABLE_ATTRIBUTES, sticky: 'first-column' },
		} );
		await editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: { ...TABLE_ATTRIBUTES, isStackedOnMobile: true, sticky: 'header' },
		} );
		await visitPublishedPost( { editor, page } );

		// Sticky header.
		await expect(
			page.locator( 'table.is-sticky-header:not(.is-stacked-on-mobile) thead' )
		).toHaveCSS( 'position', 'sticky' );

		// Sticky first column.
		const firstColumnRows = page.locator( 'table.is-sticky-first-column tr' );
		await expect( firstColumnRows ).toHaveCount( 3 );
		for ( const row of await firstColumnRows.all() ) {
			await expect( row.locator( 'th, td' ).first() ).toHaveCSS( 'position', 'sticky' );
			await expect( row.locator( 'th, td' ).nth( 1 ) ).toHaveCSS( 'position', 'static' );
		}

		// The header should not be sticky when the table is stacked on mobile.
		await expect( page.locator( 'table.is-sticky-header.is-stacked-on-mobile thead' ) ).toHaveCSS(
			'position',
			'static'
		);
	} );
} );
