/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * Internal dependencies
 */
import { test, expect } from '../util';
import type FlexibleTableBlockUtils from '../util';

async function applyCellStyles( page: Page, fsbUtils: FlexibleTableBlockUtils ) {
	// Font Size, Line Hiehgt, Width styles.
	await page.getByRole( 'spinbutton', { name: 'Cell font size' } ).fill( '20' );
	await page.getByRole( 'spinbutton', { name: 'Cell line height' } ).fill( '2' );
	await page.getByRole( 'spinbutton', { name: 'Cell width' } ).fill( '100' );

	// Text Color, Background Color styles.
	await fsbUtils.pickColor(
		page.getByRole( 'button', { name: 'Cell text color', exact: true } ),
		'111111'
	);
	await fsbUtils.pickColor(
		page.getByRole( 'button', { name: 'Cell background color', exact: true } ),
		'333333'
	);

	// Padding, Border Radius, Border Width styles.
	const styles = [
		{
			group: 'Cell padding',
			labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
		},
		{
			group: 'Cell border radius',
			labels: [ 'Top left', 'Top right', 'Bottom right', 'Bottom left' ],
		},
		{
			group: 'Cell border width',
			labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
		},
	];
	for ( let i = 0; i < styles.length; i++ ) {
		const { group, labels } = styles[ i ];
		await page
			.getByRole( 'group', { name: group } )
			.getByRole( 'button', { name: 'Unlink sides' } )
			.click();
		for ( let j = 0; j < labels.length; j++ ) {
			await page
				.getByRole( 'group', { name: group } )
				.getByRole( 'spinbutton', { name: labels[ j ] } )
				.fill( ( j + 1 ).toString() );
		}
	}

	// Boder Style styles.
	const cellBorderStyle = page.getByRole( 'group', { name: 'Cell border style' } );
	await cellBorderStyle.getByRole( 'button', { name: 'Unlink sides' } ).click();
	const cellBorderStyles = [
		{ side: 'Top', style: 'Solid' },
		{ side: 'Right', style: 'Dotted' },
		{ side: 'Bottom', style: 'Dashed' },
		{ side: 'Left', style: 'Double' },
	];
	for ( const { side, style } of cellBorderStyles ) {
		await cellBorderStyle
			.getByRole( 'group', { name: side, exact: true } )
			.getByRole( 'button', { name: style, exact: true } )
			.click();
	}

	// Border Color styles.
	await page
		.getByRole( 'group', { name: 'Cell border color' } )
		.getByRole( 'button', { name: 'Unlink sides' } )
		.click();
	const colors = [
		{ color: '111111', label: 'Top' },
		{ color: '222222', label: 'Right' },
		{ color: '333333', label: 'Bottom' },
		{ color: '444444', label: 'Left' },
	];
	for ( const { color, label } of colors ) {
		await fsbUtils.pickColor(
			page
				.getByRole( 'group', { name: 'Cell border color' } )
				.getByRole( 'button', { name: label } ),
			color
		);
	}
	// Cell Alignment styles.
	await page.getByRole( 'button', { name: 'Align center' } ).click();
	await page.getByRole( 'button', { name: 'Align middle' } ).click();
	// Cell Tag element.
	await page.getByRole( 'radio', { name: 'TD' } ).click();
	await page.getByRole( 'radio', { name: 'TH' } ).click();
	// Cell CSS class.
	await page.getByRole( 'textbox', { name: 'Cell CSS class(es)' } ).fill( 'custom' );
	// id, headers, scope getBlockAttributes.
	await page.getByRole( 'textbox', { name: 'id attribute' } ).fill( 'id' );
	await page.getByRole( 'textbox', { name: 'headers attribute' } ).fill( 'headers' );
	await page.getByRole( 'combobox', { name: 'scope attribute' } ).selectOption( 'row' );
}

test.describe( 'Styles', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'table styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.openBlockSidebar( { panel: 'Table settings' } );

		// Toggle settings.
		await page.getByRole( 'switch', { name: 'Fixed width table cells' } ).uncheck();
		await page.getByRole( 'switch', { name: 'Scroll on desktop view' } ).check();
		await page.getByRole( 'switch', { name: 'Scroll on mobile view' } ).check();
		await page.getByRole( 'switch', { name: 'Stack on mobile' } ).check();
		await page
			.getByRole( 'combobox', { name: 'Fixed control' } )
			.selectOption( 'Fixed first column' );

		// Width styles.
		await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '500' );
		// Change table max width.
		await page.getByRole( 'spinbutton', { name: 'Table max width' } ).fill( '600' );
		await page.getByRole( 'spinbutton', { name: 'Table min width' } ).fill( '400' );
		// Change table min height.
		await page.getByRole( 'spinbutton', { name: 'Table min height' } ).fill( '300' );
		// Padding, Border Radius, Border Width styles.
		const styles = [
			{
				group: 'Table padding',
				labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
			},
			{
				group: 'Table border radius',
				labels: [ 'Top left', 'Top right', 'Bottom right', 'Bottom left' ],
			},
			{
				group: 'Table border width',
				labels: [ 'Top', 'Right', 'Bottom', 'Left' ],
			},
		];
		for ( let i = 0; i < styles.length; i++ ) {
			const { group, labels } = styles[ i ];
			await page
				.getByRole( 'group', { name: group } )
				.getByRole( 'button', { name: 'Unlink sides' } )
				.click();
			for ( let j = 0; j < labels.length; j++ ) {
				await page
					.getByRole( 'group', { name: group } )
					.getByRole( 'spinbutton', { name: labels[ j ] } )
					.fill( ( j + 1 ).toString() );
			}
		}

		// Boder Style styles.
		const tableBorderStyle = page.getByRole( 'group', { name: 'Table border style' } );
		await tableBorderStyle.getByRole( 'button', { name: 'Unlink sides' } ).click();
		const tableBorderStyles = [
			{ side: 'Top', style: 'Solid' },
			{ side: 'Right', style: 'Dotted' },
			{ side: 'Bottom', style: 'Dashed' },
			{ side: 'Left', style: 'Double' },
		];
		for ( const { side, style } of tableBorderStyles ) {
			await tableBorderStyle
				.getByRole( 'group', { name: side, exact: true } )
				.getByRole( 'button', { name: style, exact: true } )
				.click();
		}

		// Border Color styles.
		await page
			.getByRole( 'group', { name: 'Table border color' } )
			.getByRole( 'button', { name: 'Unlink sides' } )
			.click();
		const colors = [
			{ color: '111111', label: 'Top' },
			{ color: '222222', label: 'Right' },
			{ color: '333333', label: 'Bottom' },
			{ color: '444444', label: 'Left' },
		];
		for ( const { color, label } of colors ) {
			await fsbUtils.pickColor(
				page
					.getByRole( 'group', { name: 'Table border color' } )
					.getByRole( 'button', { name: label } ),
				color
			);
		}

		// Border Spacing styles.
		await page.getByRole( 'button', { name: 'Separate' } ).click();
		await page.getByRole( 'button', { name: 'Unlink directions' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Horizontal' } ).fill( '10' );
		await page.getByRole( 'spinbutton', { name: 'Vertical' } ).fill( '20' );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'cell styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.getBodyCell( 0 ).click();
		await fsbUtils.openBlockSidebar( { panel: 'Cell settings' } );
		await applyCellStyles( page, fsbUtils );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'cell styles should be applied to multiple cells', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock( { header: true, footer: true } );
		await editor.canvas.getByRole( 'button', { name: 'Select column' } ).nth( 2 ).click();
		await fsbUtils.openBlockSidebar( { panel: 'Multi cells settings' } );
		await applyCellStyles( page, fsbUtils );
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'caption styles should be applied', async ( { editor, page, fsbUtils } ) => {
		await fsbUtils.createFlexibleTableBlock();
		await editor.clickBlockToolbarButton( 'Add caption' );
		await editor.canvas
			.getByRole( 'textbox', { name: 'Table caption text' } )
			.fill( 'Flexible Table Block' );
		await fsbUtils.openBlockSidebar( { panel: 'Caption settings' } );
		await page.getByRole( 'spinbutton', { name: 'Caption font size' } ).fill( '20' );
		await page.getByRole( 'spinbutton', { name: 'Caption line height' } ).fill( '2' );
		await page.getByRole( 'button', { name: 'Unlink sides' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Top' } ).fill( '1' );
		await page.getByRole( 'spinbutton', { name: 'Right' } ).fill( '2' );
		await page.getByRole( 'spinbutton', { name: 'Bottom' } ).fill( '3' );
		await page.getByRole( 'spinbutton', { name: 'Left' } ).fill( '4' );
		await page.getByRole( 'radio', { name: 'Top' } ).click();
		await page.getByRole( 'button', { name: 'Align center' } ).click();
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
