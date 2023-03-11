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
	inputValueFromAriaLabel,
	inputValueFromLabelledBy,
	clickToggleControlWithText,
	getWpVersion,
	openSidebar,
	openSidebarPanelWithTitle,
} from '../helper';

/** @type {import('puppeteer').Page} */
const page = global.page;

describe( 'Style', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'caption settings should be applied', async () => {
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
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'ArrowDown' );
		await inputValueFromAriaLabel( '.ftb-padding-control__input-controls', 'Bottom', '3' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'ArrowDown' );
		await page.keyboard.press( 'ArrowDown' );
		await inputValueFromAriaLabel( '.ftb-padding-control__input-controls', 'Left', '4' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'ArrowDown' );
		await page.keyboard.press( 'ArrowDown' );
		await clickButtonWithText(
			'//*[@aria-labelledby="flexible-table-block-caption-side-heading"]',
			'Top'
		);
		await clickButtonWithAriaLabel( '.edit-post-sidebar', 'Align center' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
