/**
 * External dependencies
 */
import type { Locator, Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { test as testBase, expect } from '@wordpress/e2e-test-utils-playwright';
import type { Editor, PageUtils } from '@wordpress/e2e-test-utils-playwright';

export default class FlexibleTableBlockUtils {
	editor: Editor;
	page: Page;
	pageUtils: PageUtils;

	constructor( { page, editor, pageUtils }: { page: Page; editor: Editor; pageUtils: PageUtils } ) {
		this.editor = editor;
		this.page = page;
		this.pageUtils = pageUtils;
	}

	async createFlexibleTableBlock( {
		col,
		row,
		header = false,
		footer = false,
	}: {
		col?: number;
		row?: number;
		header?: boolean;
		footer?: boolean;
	} = {} ) {
		await this.editor.insertBlock( { name: 'flexible-table-block/table' } );

		if ( header ) {
			await this.editor.canvas.getByRole( 'switch', { name: 'Header section' } ).check();
		}
		if ( footer ) {
			await this.editor.canvas.getByRole( 'switch', { name: 'Footer section' } ).check();
		}
		if ( col ) {
			await this.editor.canvas
				.getByRole( 'spinbutton', { name: 'Column count' } )
				.fill( String( col ) );
		}
		if ( row ) {
			await this.editor.canvas
				.getByRole( 'spinbutton', { name: 'Row count' } )
				.fill( String( row ) );
		}

		await this.editor.canvas.getByRole( 'button', { name: 'Create Table' } ).click();
	}

	async createCoreTableBlock( {
		col,
		row,
	}: {
		col?: number;
		row?: number;
	} = {} ) {
		await this.editor.insertBlock( { name: 'core/table' } );

		if ( col ) {
			await this.editor.canvas
				.getByRole( 'spinbutton', { name: 'Column count' } )
				.fill( String( col ) );
		}
		if ( row ) {
			await this.editor.canvas
				.getByRole( 'spinbutton', { name: 'Row count' } )
				.fill( String( row ) );
		}

		await this.editor.canvas.getByRole( 'button', { name: 'Create Table' } ).click();
	}

	getBodyCell( index: number ) {
		return this.editor.canvas.getByRole( 'textbox', { name: 'Body cell text' } ).nth( index );
	}

	async selectBodyCellRange( start: number, end: number ) {
		await this.getBodyCell( start ).click();
		await this.page.keyboard.down( 'Shift' );
		await this.getBodyCell( end ).click();
		await this.page.keyboard.up( 'Shift' );
	}

	async clickEditTableMenuItem( name: string ) {
		await this.editor.clickBlockToolbarButton( 'Edit table' );
		await this.page.getByRole( 'menuitem', { name } ).click();
	}

	async mergeBodyCells( start: number, end: number ) {
		await this.selectBodyCellRange( start, end );
		await this.clickEditTableMenuItem( 'Merge cells' );
	}

	/**
	 * Opens a tab of the block inspector and, optionally, one of its panels.
	 *
	 * @param options       Options.
	 * @param options.tab   Name of the block inspector tab.
	 * @param options.panel Name of the panel to open.
	 */
	async openBlockSidebar( { tab = 'Settings', panel }: { tab?: string; panel?: string } = {} ) {
		await this.editor.openDocumentSettingsSidebar();
		await this.page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'tab', { name: tab } )
			.click();
		if ( panel ) {
			await this.page.getByRole( 'button', { name: panel, exact: true } ).click();
		}
	}

	/**
	 * Picks a color through the color picker popover opened by the given button.
	 *
	 * @param button Button that opens the color picker popover.
	 * @param color  Hex color without the leading "#".
	 */
	async pickColor( button: Locator, color: string ) {
		await button.click();
		await this.pageUtils.pressKeys( 'Enter' );
		await this.page.getByRole( 'textbox', { name: 'Hex color' } ).fill( color );
		await this.pageUtils.pressKeys( 'Escape', { times: 2 } );
	}

	getGlobalSettingModal() {
		return this.page.getByRole( 'dialog', { name: 'Flexible Table Block Global setting' } );
	}

	async openGlobalSetting() {
		await this.editor.openDocumentSettingsSidebar();
		await this.page.getByRole( 'button', { name: 'Global setting', exact: true } ).click();
		await this.page.getByRole( 'button', { name: 'Edit global setting' } ).click();
	}

	/**
	 * Waits for the notice in the global setting modal and dismisses it.
	 *
	 * @param message Expected notice message.
	 */
	async dismissGlobalSettingNotice( message: string ) {
		const modal = this.getGlobalSettingModal();
		await expect( modal.getByText( message, { exact: true } ) ).toBeVisible();
		await modal.getByRole( 'button', { name: 'Dismiss' } ).click();
		await expect( modal.getByText( message, { exact: true } ) ).toBeHidden();
	}

	async restoreGlobalSetting() {
		await this.page.getByRole( 'button', { name: 'Restore default settings' } ).click();
		await this.page.getByRole( 'button', { name: 'Restore', exact: true } ).click();
		await this.dismissGlobalSettingNotice( 'Global setting restored.' );
	}

	async saveGlobalSetting() {
		await this.page.getByRole( 'button', { name: 'Save settings' } ).click();
		await this.dismissGlobalSettingNotice( 'Global setting saved.' );
	}

	/**
	 * Returns the CSS that the global setting injects into the editor styles.
	 */
	async getGlobalSettingCss() {
		return this.page.evaluate( () => {
			const blockStyle = window.wp.data
				.select( 'core/editor' )
				.getEditorSettings()
				.styles.find(
					( style: { flexibleTableBlock?: boolean; css: string } ) => style.flexibleTableBlock
				);
			return blockStyle ? blockStyle.css : '';
		} );
	}
}

export const test = testBase.extend< { fsbUtils: FlexibleTableBlockUtils } >( {
	fsbUtils: async ( { page, editor, pageUtils }, use ) => {
		await use( new FlexibleTableBlockUtils( { page, editor, pageUtils } ) );
	},
} );

export { expect };
