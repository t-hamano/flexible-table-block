/**
 * WordPress dependencies
 */
import { getEditedPostContent, createNewPost, clickButton } from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	getWpVersion,
	createNewFlexibleTableBlock,
	flexibleTableSelector,
	flexibleTableCellSelector,
	flexibleTableCaptionSelector,
	clickButtonWithAriaLabel,
	clickButtonWithText,
	inputValueFromLabel,
	inputValueFromAriaLabel,
	clickToggleControlWithText,
	openSidebar,
	openSidebarPanelWithTitle,
	selectOptionFromLabel,
} from '../helper';

/** @type {import('puppeteer').Page} */
const page = global.page;

async function applyCellStyles() {
	const wpVersion = await getWpVersion();

	// Font Size, Line Hiehgt, Width styles.
	await inputValueFromLabel( 'Cell Font Size', '20px' );
	await inputValueFromLabel( 'Cell Line Height', '2' );
	await inputValueFromLabel( 'Cell Width', '100px' );

	// Text Color, Background Color styles.
	await clickButtonWithAriaLabel(
		'[aria-labelledby="flexible-table-block-cell-text-color-heading"]',
		'All'
	);
	await page.keyboard.press( 'Enter' );

	if ( [ '5-9', '6' ].includes( wpVersion ) ) {
		await clickButtonWithAriaLabel( '.components-popover__content', 'Show detailed inputs' );
	}
	await inputValueFromLabel( 'Hex color', '111111' );
	await page.keyboard.press( 'Escape' );
	await page.keyboard.press( 'Escape' );
	await clickButtonWithAriaLabel(
		'[aria-labelledby="flexible-table-block-cell-background-color-heading"]',
		'All'
	);
	await page.keyboard.press( 'Enter' );
	if ( [ '5-9', '6' ].includes( wpVersion ) ) {
		await clickButtonWithAriaLabel( '.components-popover__content', 'Show detailed inputs' );
	}
	await inputValueFromLabel( 'Hex color', '333333' );

	// Padding, Border Radius, Border Width styles.
	const styles = [
		{ style: 'padding', labels: [ 'Top', 'Right', 'Bottom', 'Left' ] },
		{
			style: 'border-radius',
			labels: [ 'Top Left', 'Top Right', 'Bottom Right', 'Bottom Left' ],
		},
		{ style: 'border-width', labels: [ 'Top', 'Right', 'Bottom', 'Left' ] },
	];
	for ( let i = 0; i < styles.length; i++ ) {
		await clickButtonWithAriaLabel(
			`.ftb-${ styles[ i ].style }-control__header-control`,
			'Unlink Sides'
		);
		await inputValueFromAriaLabel(
			`.ftb-${ styles[ i ].style }-control__input-controls`,
			styles[ i ].labels[ 0 ],
			'1'
		);
		await inputValueFromAriaLabel(
			`.ftb-${ styles[ i ].style }-control__input-controls`,
			styles[ i ].labels[ 1 ],
			'2'
		);
		await inputValueFromAriaLabel(
			`.ftb-${ styles[ i ].style }-control__input-controls`,
			styles[ i ].labels[ 2 ],
			'3'
		);
		await inputValueFromAriaLabel(
			`.ftb-${ styles[ i ].style }-control__input-controls`,
			styles[ i ].labels[ 3 ],
			'4'
		);
	}

	// Boder Style styles.
	await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Unlink Sides' );
	await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Solid', 0 );
	await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Dotted', 1 );
	await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Dashed', 2 );
	await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Double', 3 );

	// Border Color styles.
	await clickButtonWithAriaLabel( '.ftb-border-color-control__controls', 'Unlink Sides' );
	const colors = [
		{ color: '111111', label: 'Top' },
		{ color: '222222', label: 'Right' },
		{ color: '333333', label: 'Bottom' },
		{ color: '444444', label: 'Left' },
	];
	for ( let i = 0; i < colors.length; i++ ) {
		await clickButtonWithAriaLabel( '.ftb-border-color-control__controls', colors[ i ].label );
		await page.keyboard.press( 'Enter' );
		if ( [ '5-9', '6' ].includes( wpVersion ) ) {
			await clickButtonWithAriaLabel( '.components-popover__content', 'Show detailed inputs' );
		}
		await inputValueFromLabel( 'Hex color', colors[ i ].color );
		await page.keyboard.press( 'Escape' );
		await page.keyboard.press( 'Escape' );
	}

	// Cell Alignment styles.
	await clickButtonWithAriaLabel( '.edit-post-sidebar', 'Align center' );
	await clickButtonWithAriaLabel( '.edit-post-sidebar', 'Align middle' );

	// Cell Tag element.
	await clickButton( 'TH' );

	// Cell CSS class.
	await inputValueFromLabel( 'Cell CSS class(es)', 'custom' );

	// id, headers, scope getBlockAttributes.
	await inputValueFromLabel( 'id attribute', 'id' );
	await inputValueFromLabel( 'headers attribute', 'headers' );
	await clickButtonWithText(
		'//*[@aria-labelledby="flexible-table-block-cell-scope-heading"]',
		'row'
	);
}

describe( 'Styles', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'table styles should be applied', async () => {
		const wpVersion = await getWpVersion();
		await createNewFlexibleTableBlock();
		await openSidebar();
		await openSidebarPanelWithTitle( 'Table Settings' );

		// Toggle settings.
		await clickToggleControlWithText( 'Fixed width table cells' );
		await clickToggleControlWithText( 'Scroll on PC view' );
		await clickToggleControlWithText( 'Scroll on Mobile view' );
		await clickToggleControlWithText( 'Stack on mobile' );
		await selectOptionFromLabel( 'Fixed control', 'first-column' );

		// Width styles.
		await inputValueFromLabel( 'Table Width', '500px' );
		await inputValueFromLabel( 'Table Max Width', '600px' );
		await inputValueFromLabel( 'Table Min Width', '400px' );

		// Padding, Border Radius, Border Width styles.
		const styles = [
			{ style: 'padding', labels: [ 'Top', 'Right', 'Bottom', 'Left' ] },
			{
				style: 'border-radius',
				labels: [ 'Top Left', 'Top Right', 'Bottom Right', 'Bottom Left' ],
			},
			{ style: 'border-width', labels: [ 'Top', 'Right', 'Bottom', 'Left' ] },
		];
		for ( let i = 0; i < styles.length; i++ ) {
			await clickButtonWithAriaLabel(
				`.ftb-${ styles[ i ].style }-control__header-control`,
				'Unlink Sides'
			);
			await inputValueFromAriaLabel(
				`.ftb-${ styles[ i ].style }-control__input-controls`,
				styles[ i ].labels[ 0 ],
				'1'
			);
			await inputValueFromAriaLabel(
				`.ftb-${ styles[ i ].style }-control__input-controls`,
				styles[ i ].labels[ 1 ],
				'2'
			);
			await inputValueFromAriaLabel(
				`.ftb-${ styles[ i ].style }-control__input-controls`,
				styles[ i ].labels[ 2 ],
				'3'
			);
			await inputValueFromAriaLabel(
				`.ftb-${ styles[ i ].style }-control__input-controls`,
				styles[ i ].labels[ 3 ],
				'4'
			);
		}

		// Boder Style styles.
		await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Unlink Sides' );
		await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Solid', 0 );
		await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Dotted', 1 );
		await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Dashed', 2 );
		await clickButtonWithAriaLabel( '.ftb-border-style-control__button-controls', 'Double', 3 );

		// Border Color styles.
		await clickButtonWithAriaLabel( '.ftb-border-color-control__controls', 'Unlink Sides' );
		const colors = [
			{ color: '111111', label: 'Top' },
			{ color: '222222', label: 'Right' },
			{ color: '333333', label: 'Bottom' },
			{ color: '444444', label: 'Left' },
		];
		for ( let i = 0; i < colors.length; i++ ) {
			await clickButtonWithAriaLabel( '.ftb-border-color-control__controls', colors[ i ].label );
			await page.keyboard.press( 'Enter' );
			if ( [ '5-9', '6' ].includes( wpVersion ) ) {
				await clickButtonWithAriaLabel( '.components-popover__content', 'Show detailed inputs' );
			}
			await inputValueFromLabel( 'Hex color', colors[ i ].color );
			await page.keyboard.press( 'Escape' );
			await page.keyboard.press( 'Escape' );
		}

		// Border Spacing styles.
		await clickButton( 'Separate' );
		await clickButtonWithAriaLabel(
			'.ftb-border-spacing-control__header-control',
			'Unlink Directions'
		);
		await inputValueFromAriaLabel(
			'.ftb-border-spacing-control__input-controls',
			'Horizontal',
			'10'
		);
		await inputValueFromAriaLabel(
			'.ftb-border-spacing-control__input-controls',
			'Vertical',
			'20'
		);
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'cell styles should be applied', async () => {
		await createNewFlexibleTableBlock();
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await openSidebar();
		await openSidebarPanelWithTitle( 'Cell Settings' );
		await applyCellStyles();
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'cell styles should be applied to multiple cells', async () => {
		await createNewFlexibleTableBlock( { header: true, footer: true } );
		await clickButtonWithAriaLabel( flexibleTableSelector, 'Select column', 2 );
		await openSidebar();
		await openSidebarPanelWithTitle( 'Multi Cells Settings' );
		await applyCellStyles();
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'caption styles should be applied', async () => {
		await createNewFlexibleTableBlock();
		await page.$$( flexibleTableCaptionSelector );
		await page.focus( flexibleTableCaptionSelector );
		await page.keyboard.type( 'Flexible Table Block' );
		await openSidebar();
		await openSidebarPanelWithTitle( 'Caption Settings' );
		await inputValueFromLabel( 'Caption Font Size', '20px' );
		await inputValueFromLabel( 'Caption Line Height', '2' );
		await clickButtonWithAriaLabel( '.ftb-padding-control__header-control', 'Unlink Sides' );
		await inputValueFromAriaLabel( '.ftb-padding-control__input-controls', 'Top', '1' );
		await inputValueFromAriaLabel( '.ftb-padding-control__input-controls', 'Right', '2' );
		await inputValueFromAriaLabel( '.ftb-padding-control__input-controls', 'Bottom', '3' );
		await inputValueFromAriaLabel( '.ftb-padding-control__input-controls', 'Left', '4' );
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-caption-side-heading"]',
			'Top'
		);
		await clickButtonWithAriaLabel( '.edit-post-sidebar', 'Align center' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
