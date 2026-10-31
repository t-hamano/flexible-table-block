/**
 * Internal dependencies
 */
import { test, expect } from '../util';

test.describe( 'Global Setting', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should update editor styles reflecting the settings', async ( {
		page,
		pageUtils,
		fsbUtils,
	} ) => {
		await fsbUtils.createFlexibleTableBlock();
		await fsbUtils.openGlobalSetting();
		// Restore settings.
		await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
		await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
		await expect(
			fsbUtils.getGlobalSettingModal().getByText( 'Global setting restored.', { exact: true } )
		).toBeVisible();
		await fsbUtils.getGlobalSettingModal().getByRole( 'button', { name: 'Dismiss' } ).click();
		const modal = fsbUtils.getGlobalSettingModal();
		// Change table width.
		await page.getByRole( 'spinbutton', { name: 'Table width' } ).fill( '90' );
		// Change table max width.
		await page.getByRole( 'spinbutton', { name: 'Table max width' } ).fill( '110' );
		await page.getByRole( 'button', { name: 'Separate' } ).click();
		// Change striped colors.
		const tableColors = [
			{ color: '111111', label: 'Striped style background color ( odd rows )' },
			{ color: '222222', label: 'Striped style background color ( even rows )' },
		];
		for ( const { color, label } of tableColors ) {
			await modal.getByRole( 'button', { name: label, exact: true } ).click();
			await pageUtils.pressKeys( 'Enter' );
			await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
			await pageUtils.pressKeys( 'Escape', { times: 2 } );
		}
		// Apply cell styles.
		await page.getByRole( 'tab', { name: 'Cell styles' } ).click();
		// Change cell colors.
		const cellColors = [
			{ color: '333333', label: 'Cell text color ( th tag )' },
			{ color: '444444', label: 'Cell text color ( td tag )' },
			{ color: '555555', label: 'Cell background color ( th tag )' },
			{ color: '666666', label: 'Cell background color ( td tag )' },
			{ color: '777777', label: 'Cell border color' },
		];
		for ( const { color, label } of cellColors ) {
			await modal.getByRole( 'button', { name: label, exact: true } ).click();
			await pageUtils.pressKeys( 'Enter' );
			await page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
			await pageUtils.pressKeys( 'Escape', { times: 2 } );
		}
		// Change cell padding.
		await page.getByRole( 'button', { name: 'Unlink sides' } ).click();
		await page.getByRole( 'spinbutton', { name: 'Top' } ).fill( '1' );
		await page.getByRole( 'spinbutton', { name: 'Right' } ).fill( '2' );
		await page.getByRole( 'spinbutton', { name: 'Bottom' } ).fill( '3' );
		await page.getByRole( 'spinbutton', { name: 'Left' } ).fill( '4' );
		// Change cell border width.
		await page.getByRole( 'spinbutton', { name: 'All' } ).fill( '2' );
		// Change cell border style.
		await page.getByRole( 'button', { name: 'Dotted' } ).click();
		// Change cell alignments.
		await page.getByRole( 'button', { name: 'Align center' } ).click();
		await page.getByRole( 'button', { name: 'Align bottom' } ).click();
		// Save settings.
		await page.getByRole( 'button', { name: 'Save settings' } ).click();
		await expect(
			fsbUtils.getGlobalSettingModal().getByText( 'Global setting saved.', { exact: true } )
		).toBeVisible();
		await fsbUtils.getGlobalSettingModal().getByRole( 'button', { name: 'Dismiss' } ).click();

		const selector = '.wp-block-flexible-table-block-table.wp-block-flexible-table-block-table';
		const savedRules = [
			`${ selector }>table{width:90%;max-width:110%;border-collapse:separate;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(odd) th{background-color:#111111;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(odd) td{background-color:#111111;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(even) th{background-color:#222222;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(even) td{background-color:#222222;}`,
			`${ selector }>table tr th,${ selector }>table tr td{padding:1em 2em 3em 4em;border-width:2px;border-style:dotted;border-color:#777777;text-align:center;vertical-align:bottom;}`,
			`${ selector }>table tr th{color:#333333;background-color:#555555;}`,
			`${ selector }>table tr td{color:#444444;background-color:#666666;}`,
		];
		for ( const rule of savedRules ) {
			await expect.poll( () => fsbUtils.getGlobalSettingCss() ).toContain( rule );
		}

		// Restore settings.
		await page.getByRole( 'button', { name: 'Restore default settings' } ).click();
		await page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
		await expect(
			fsbUtils.getGlobalSettingModal().getByText( 'Global setting restored.', { exact: true } )
		).toBeVisible();
		await fsbUtils.getGlobalSettingModal().getByRole( 'button', { name: 'Dismiss' } ).click();

		const defaultRules = [
			`${ selector }>table{width:100%;max-width:100%;border-collapse:collapse;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(odd) th{background-color:#f0f0f1;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(odd) td{background-color:#f0f0f1;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(even) th{background-color:#ffffff;}`,
			`${ selector }.is-style-stripes tbody tr:nth-child(even) td{background-color:#ffffff;}`,
			`${ selector }>table tr th,${ selector }>table tr td{padding:0.5em;border-width:1px;border-style:solid;border-color:#000000;text-align:left;vertical-align:middle;}`,
			`${ selector }>table tr th{background-color:#f0f0f1;}`,
			`${ selector }>table tr td{background-color:#ffffff;}`,
		];
		for ( const rule of defaultRules ) {
			await expect.poll( () => fsbUtils.getGlobalSettingCss() ).toContain( rule );
		}
	} );
} );
