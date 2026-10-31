/**
 * External dependencies
 */
import type { Dispatch, SetStateAction } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	toTableAttributes,
	isEmptySection,
	type VTable,
	type VCell,
	type VSelectedLine,
	type VSelectedCells,
} from '../utils/table-state';
import { useWarningNotice } from './use-warning-notice';
import type { BlockAttributes, SectionName } from '../BlockAttributes';

type Options = {
	vTable: VTable;
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void;
	setSelectedCells: Dispatch< SetStateAction< VSelectedCells > >;
	setSelectedLine: Dispatch< SetStateAction< VSelectedLine > >;
};

/**
 * Returns the row and column operations shared by the block toolbar and the in-table buttons.
 *
 * @param options                  Hook options.
 * @param options.vTable           Current virtual table.
 * @param options.setAttributes    Block attributes setter.
 * @param options.setSelectedCells Selected cells state setter.
 * @param options.setSelectedLine  Selected line state setter.
 */
export function useTableOperations( options: Options ) {
	const { vTable, setAttributes, setSelectedCells, setSelectedLine } = options;
	const showWarningNotice = useWarningNotice();

	// Save the new table and release the cell selection.
	const updateTable = ( newVTable: VTable ) => {
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	// Insert a row before (offset: 0) or after (offset: 1) the target cell, considering its rowspan.
	const onInsertRow = ( targetCell: VCell, offset: 0 | 1 ) => {
		const { sectionName, rowIndex, rowSpan } = targetCell;
		const insertRowIndex = offset === 0 ? rowIndex : rowIndex + rowSpan;
		updateTable( insertRow( vTable, { sectionName, rowIndex: insertRowIndex } ) );
	};

	const onDeleteRow = ( sectionName: SectionName, rowIndex: number ) => {
		// Do not allow tbody to be empty for table with thead /tfoot sections.
		if (
			sectionName === 'body' &&
			vTable.body.length === 1 &&
			( ! isEmptySection( vTable.head ) || ! isEmptySection( vTable.foot ) )
		) {
			showWarningNotice(
				__( 'The table body must have one or more rows.', 'flexible-table-block' ),
				'flexible-table-block-body-row'
			);
			return;
		}

		updateTable( deleteRow( vTable, { sectionName, rowIndex } ) );
	};

	// Insert a column before (offset: 0) or after (offset: 1) the target cell, considering its colspan.
	const onInsertColumn = ( targetCell: VCell, offset: 0 | 1 ) => {
		const { vColIndex, colSpan } = targetCell;
		const insertVColIndex = offset === 0 ? vColIndex : vColIndex + colSpan;
		updateTable( insertColumn( vTable, { vColIndex: insertVColIndex } ) );
	};

	const onDeleteColumn = ( vColIndex: number ) => {
		updateTable( deleteColumn( vTable, { vColIndex } ) );
	};

	return {
		updateTable,
		onInsertRow,
		onDeleteRow,
		onInsertColumn,
		onDeleteColumn,
	};
}
