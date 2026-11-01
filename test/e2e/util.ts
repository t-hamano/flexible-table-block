/**
 * External dependencies
 */
import type { Page } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { test as testBase, expect } from '@wordpress/e2e-test-utils-playwright';
import type { Editor } from '@wordpress/e2e-test-utils-playwright';

type TableOptions = {
	col?: number;
	row?: number;
	header?: boolean;
	footer?: boolean;
};

/**
 * Builds the same table attributes as the "Create Table" button in the placeholder.
 *
 * @param options Table size and sections.
 */
function createTableAttributes( options: TableOptions ) {
	const { col = 3, row = 3, header = false, footer = false } = options;
	const createRows = ( rowCount: number, tag: 'th' | 'td' ) =>
		Array.from( { length: rowCount }, () => ( {
			cells: Array.from( { length: col }, () => ( { content: '', tag } ) ),
		} ) );

	return {
		head: header ? createRows( 1, 'th' ) : [],
		body: createRows( row, 'td' ),
		foot: footer ? createRows( 1, 'td' ) : [],
	};
}

export default class FlexibleTableBlockUtils {
	editor: Editor;
	page: Page;

	constructor( { page, editor }: { page: Page; editor: Editor } ) {
		this.editor = editor;
		this.page = page;
	}

	async createFlexibleTableBlock( options: TableOptions = {} ) {
		await this.editor.insertBlock( {
			name: 'flexible-table-block/table',
			attributes: createTableAttributes( options ),
		} );
	}

	async createCoreTableBlock( options: Pick< TableOptions, 'col' | 'row' > = {} ) {
		await this.editor.insertBlock( {
			name: 'core/table',
			attributes: createTableAttributes( options ),
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
