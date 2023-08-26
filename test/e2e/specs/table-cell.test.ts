/**
 * WordPress dependencies
 */
import {
	getEditedPostContent,
	createNewPost,
	clickButton,
	clickBlockToolbarButton,
	pressKeyWithModifier,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	flexibleTableCellSelector,
	createNewFlexibleTableBlock,
	clickButtonWithAriaLabel,
	clickButtonWithText,
	clickToggleControlWithText,
	openSidebar,
	getWpVersion,
} from '../helper';
import { link } from '@wordpress/icons';

/** @type {import('puppeteer').Page} */
const page = global.page;

describe( 'Flexible table cell', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'allows cell movement with tab key.', async () => {
		const wpVersion = await getWpVersion();
		await createNewFlexibleTableBlock();
		await openSidebar();
		await clickButton( 'Global setting' );

		// Restore settings.
		await clickButton( 'Restore default settings' );
		await clickButtonWithText(
			'//div[contains(@class,"ftb-global-setting-modal__confirm-popover")]',
			'Restore'
		);
		await page.waitForSelector( '.ftb-global-setting-modal__notice' );
		await clickButtonWithAriaLabel( '.ftb-global-setting-modal__notice', 'Dismiss this notice' );

		await clickButton( 'Editor options' );
		await clickToggleControlWithText( 'Use the tab key to move cells' );
		await clickButtonWithText(
			'//div[@class="ftb-global-setting-modal__buttons"]',
			'Save setting'
		);
		await page.waitForSelector( '.ftb-global-setting-modal__notice' );
		const modalCloseLabel = [ '6-2', '6-3', '6-4' ].includes( wpVersion )
			? 'Close'
			: 'Close dialog';
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

	it( 'allows keyboard operation within the link popover', async () => {
		await createNewFlexibleTableBlock();
		const cells = await page.$$( flexibleTableCellSelector );
		await cells[ 0 ].click();
		await page.keyboard.type( 'Link' );
		await pressKeyWithModifier( 'primary', 'a' );
		await clickBlockToolbarButton( 'Link' );

		// Create a link.
		await page.keyboard.down( 'Shift' );
		await page.keyboard.type( '#anchor' );
		await page.keyboard.up( 'Shift' );
		await page.keyboard.press( 'Enter' );

		expect( await getEditedPostContent() ).toMatchSnapshot();

		// Edit the link.
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '-updated' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.type( '#anchor-updated' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Space' );
		await clickButtonWithText( '//div[contains(@class,"components-popover")]', 'Save' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
