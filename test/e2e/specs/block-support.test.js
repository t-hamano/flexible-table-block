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

		const controls = [
			'Show Font family',
			'Show Font size',
			'Show Appearance',
			'Show Line height',
			'Show Letter case',
			'Show Letter-spacing',
		];

		for ( let i = 0; i < controls.length; i++ ) {
			await openToolsPanelMenu();
			await page.click( `button[aria-label="${ controls[ i ] }"]` );
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
		await inputValueFromLabel( 'Letter-spacing', '10' );
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
