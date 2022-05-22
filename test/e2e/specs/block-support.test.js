/**
 * WordPress dependencies
 */
import { getEditedPostContent, createNewPost } from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	createNewFlexibleTableBlock,
	openSidebar,
	openToolsPanelMenu,
	clickButtonWithAriaLabel,
	inputValueFromLabel,
	inputValueFromAriaLabel,
	selectOptionFromLabel,
} from '../helper';

/** @type {import('puppeteer').Page} */
const page = global.page;

describe( 'Block Support', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'typography settings should be applied', async () => {
		await createNewFlexibleTableBlock();
		await openSidebar();

		for ( let i = 0; i < 6; i++ ) {
			await openToolsPanelMenu();
			const selector =
				i === 0
					? 'div[aria-label="View and add options"] button.components-menu-item__button'
					: 'div[aria-label="View options"] button.components-menu-item__button';
			const elements = await page.$$( selector );
			await elements[ i ].click();
		}

		await selectOptionFromLabel( 'Font family', '"Source Serif Pro", serif' );
		await clickButtonWithAriaLabel( '.components-font-size-picker', 'Large' );
		await clickButtonWithAriaLabel( '.typography-block-support-panel', 'Appearance' );
		for ( let i = 0; i < 5; i++ ) {
			await page.keyboard.press( 'ArrowDown' );
		}
		await page.keyboard.press( 'Enter' );

		await inputValueFromLabel( 'Line height', '3' );
		await clickButtonWithAriaLabel( '.typography-block-support-panel', 'Lowercase' );
		await page.focus( 'input[aria-label="Letter-spacing"], input[aria-label="Letter spacing"]' );
		await page.keyboard.type( '10' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'dimensions settings should be applied', async () => {
		await createNewFlexibleTableBlock();
		await openSidebar();
		await openToolsPanelMenu( 'dimensions' );
		await page.click( `button[aria-label="Show Margin"]` );
		await clickButtonWithAriaLabel( '.dimensions-block-support-panel', 'Unlink Sides' );
		await inputValueFromAriaLabel( '.dimensions-block-support-panel', 'Top', '10' );
		await inputValueFromAriaLabel( '.dimensions-block-support-panel', 'Right', '20' );
		await inputValueFromAriaLabel( '.dimensions-block-support-panel', 'Bottom', '30' );
		await inputValueFromAriaLabel( '.dimensions-block-support-panel', 'Left', '40' );
		await page.keyboard.press( 'Enter' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
