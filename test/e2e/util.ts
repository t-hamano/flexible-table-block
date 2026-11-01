/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { test as testBase, expect } from '@wordpress/e2e-test-utils-playwright';
import type { Editor } from '@wordpress/e2e-test-utils-playwright';

export default class FlexibleTableBlockUtils {
	editor: Editor;
	page: Page;

	constructor( { page, editor }: { page: Page; editor: Editor } ) {
		this.editor = editor;
		this.page = page;
	}

	async createFlexibleTableBlock( {
		col = 3,
		row = 3,
		header = false,
		footer = false,
	}: {
		col?: number;
		row?: number;
		header?: boolean;
		footer?: boolean;
	} = {} ) {
		const cells = ( tag: 'th' | 'td' ) =>
			Array.from( { length: col }, () => ( { content: '', tag } ) );

		await this.editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: {
				head: header ? [ { cells: cells( 'th' ) } ] : [],
				body: Array.from( { length: row }, () => ( { cells: cells( 'td' ) } ) ),
				foot: footer ? [ { cells: cells( 'td' ) } ] : [],
			},
		} );
	}

	async createCoreTableBlock( { col = 2, row = 2 }: { col?: number; row?: number } = {} ) {
		await this.editor.insertBlock( {
			name: 'core/table',
			attributes: {
				body: Array.from( { length: row }, () => ( {
					cells: Array.from( { length: col }, () => ( { content: '', tag: 'td' } ) ),
				} ) ),
			},
		} );
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
	fsbUtils: async ( { page, editor }, use ) => {
		await use( new FlexibleTableBlockUtils( { page, editor } ) );
	},
} );

export { expect };
