/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import type { Editor } from '@wordpress/e2e-test-utils-playwright';

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
			await this.editor.canvas.getByRole( 'checkbox', { name: 'Header section' } ).check();
		}
		if ( footer ) {
			await this.editor.canvas.getByRole( 'checkbox', { name: 'Footer section' } ).check();
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
}
