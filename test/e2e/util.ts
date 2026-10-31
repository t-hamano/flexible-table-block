/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { test as testBase, expect } from '@wordpress/e2e-test-utils-playwright';
import type { Editor, RequestUtils } from '@wordpress/e2e-test-utils-playwright';

export default class FlexibleTableBlockUtils {
	editor: Editor;
	page: Page;

	constructor( { page, editor }: { page: Page; editor: Editor } ) {
		this.editor = editor;
		this.page = page;
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

/**
 * Resets all plugin options to their defaults via the REST API.
 *
 * @param requestUtils Request utils.
 */
export async function resetOptions( requestUtils: RequestUtils ) {
	await requestUtils.rest( {
		method: 'DELETE',
		path: '/flexible-table-block/v1/options',
	} );
}

export const test = testBase.extend< { fsbUtils: FlexibleTableBlockUtils } >( {
	fsbUtils: async ( { page, editor }, use ) => {
		await use( new FlexibleTableBlockUtils( { page, editor } ) );
	},
} );

export { expect };
