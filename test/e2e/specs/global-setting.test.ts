/**
 * WordPress dependencies
 */
import { createNewPost, clickButton } from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import {
	createNewFlexibleTableBlock,
	clickButtonWithAriaLabel,
	clickButtonWithText,
	openSidebar,
	inputValueFromLabel,
	inputValueFromAriaLabel,
	getWpVersion,
} from '../helper';

/** @type {import('puppeteer').Page} */
const page = global.page;

describe( 'Global Setting', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	it( 'should output inline style reflecting the settings', async () => {
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

		// Apply table styles.
		await inputValueFromLabel( 'Table width', '90' );
		await inputValueFromLabel( 'Table max width', '110' );
		await clickButton( 'Separate' );
		const tableColors = [
			{ color: '111111', selector: 'odd' },
			{ color: '222222', selector: 'even' },
		];
		for ( let i = 0; i < tableColors.length; i++ ) {
			await clickButtonWithAriaLabel(
				`[aria-labelledby="flexible-table-block-global-row-${ tableColors[ i ].selector }-color-heading"]`,
				'All'
			);
			await page.keyboard.press( 'Enter' );
			if ( wpVersion === '6' ) {
				await clickButtonWithAriaLabel( '.components-popover__content', 'Show detailed inputs' );
			}
			await inputValueFromLabel( 'Hex color', tableColors[ i ].color );
			await page.keyboard.press( 'Escape' );
			await page.keyboard.press( 'Escape' );
		}

		// Apply cell styles.
		await clickButton( 'Cell styles' );
		const cellColors = [
			{ color: '333333', selector: 'text-color-th' },
			{ color: '444444', selector: 'text-color-td' },
			{ color: '555555', selector: 'background-color-th' },
			{ color: '666666', selector: 'background-color-td' },
			{ color: '777777', selector: 'border-color' },
		];
		for ( let i = 0; i < cellColors.length; i++ ) {
			await clickButtonWithAriaLabel(
				`[aria-labelledby="flexible-table-block-global-cell-${ cellColors[ i ].selector }-heading"]`,
				'All'
			);

			await page.keyboard.press( 'Enter' );
			if ( wpVersion === '6' ) {
				await clickButtonWithAriaLabel( '.components-popover__content', 'Show detailed inputs' );
			}
			await inputValueFromLabel( 'Hex color', cellColors[ i ].color );
			await page.keyboard.press( 'Escape' );
			await page.keyboard.press( 'Escape' );
		}
		await clickButtonWithAriaLabel( '.ftb-global-setting-modal__styles-item', 'Unlink sides' );
		await inputValueFromAriaLabel( '.ftb-global-setting-modal__styles-item', 'Top', '1' );
		await inputValueFromAriaLabel( '.ftb-global-setting-modal__styles-item', 'Right', '2' );
		await inputValueFromAriaLabel( '.ftb-global-setting-modal__styles-item', 'Bottom', '3' );
		await inputValueFromAriaLabel( '.ftb-global-setting-modal__styles-item', 'Left', '4' );
		await inputValueFromAriaLabel( '.ftb-border-width-control__header-control', 'All', '2' );
		await clickButtonWithAriaLabel( '.ftb-global-setting-modal__styles-item', 'Dotted' );
		await clickButtonWithAriaLabel( '.ftb-global-setting-modal__styles-item', 'Align center' );
		await clickButtonWithAriaLabel( '.ftb-global-setting-modal__styles-item', 'Align bottom' );

		await clickButtonWithText(
			'//div[@class="ftb-global-setting-modal__buttons"]',
			'Save setting'
		);
		await page.waitForSelector( '.ftb-global-setting-modal__notice' );

		const [ styleTag ] = await page.$$( '#flexible-table-block-editor-inline-css' );
		const innerText = await page.evaluate( ( element ) => element.innerText, styleTag );

		expect( innerText ).toBe(
			`.editor-styles-wrapper .wp-block-flexible-table-block-table>table{width:90%;max-width:110%;border-collapse:separate;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) th{background-color:#111111;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) td{background-color:#111111;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) th{background-color:#222222;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) td{background-color:#222222;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th,.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{padding:1em 2em 3em 4em;border-width:2px;border-style:dotted;border-color:#777777;text-align:center;vertical-align:bottom;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th{color:#333333;background-color:#555555;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{color:#444444;background-color:#666666;}`
		);

		// Restore settings.
		await clickButton( 'Restore default settings' );
		await clickButtonWithText(
			'//div[contains(@class,"ftb-global-setting-modal__confirm-popover")]',
			'Restore'
		);
		await page.waitForSelector( '.ftb-global-setting-modal__notice' );
		const [ defaultStyleTag ] = await page.$$( '#flexible-table-block-editor-inline-css' );
		const defaultInnerText = await page.evaluate(
			( element ) => element.innerText,
			defaultStyleTag
		);
		expect( defaultInnerText ).toBe(
			`.editor-styles-wrapper .wp-block-flexible-table-block-table>table{width:100%;max-width:100%;border-collapse:collapse;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) th{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) td{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) th{background-color:#ffffff;}.editor-styles-wrapper .wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(even) td{background-color:#ffffff;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th,.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{padding:0.5em;border-width:1px;border-style:solid;border-color:#000000;text-align:left;vertical-align:middle;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr th{background-color:#f0f0f1;}.editor-styles-wrapper .wp-block-flexible-table-block-table>table tr td{background-color:#ffffff;}`
		);

		const modalCloseLabel = [ '6-2', '6-3', '6-4' ].includes( wpVersion )
			? 'Close'
			: 'Close dialog';
		await clickButtonWithAriaLabel( '.ftb-global-setting-modal', modalCloseLabel );
	} );
} );
