/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
	InspectorControls,
	BlockControls,
	AlignmentControl,
	useBlockProps
} from '@wordpress/block-editor';
import {
	ToolbarDropdownMenu
} from '@wordpress/components';
import {
	tableColumnAfter,
	tableColumnBefore,
	tableColumnDelete,
	tableRowAfter,
	tableRowBefore,
	tableRowDelete,
	table
} from '@wordpress/icons';

/**
 * Internal components
 */
import TableControls from './controls/TableControls';
import CaptionControls from './controls/CaptionControls';
import CellsControls from './controls/CellsControls';

import Table from './components/Table';
import TablePlaceholder from './components/TablePlaceholder';
import TableCaption from './components/TableCaption';

/**
 * Internal dependencies
 */
import './editor.scss';
import {
	updateSelectedCell,
	getCellAttribute,
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	isEmptyTableSection
} from './utils/state';
import { ALIGNMENT_CONTROLS } from './utils/constants';

function TableEdit({
	attributes,
	setAttributes,
	insertBlocksAfter,
	isSelected
}) {
	const { captionSide	} = attributes;

	const [ selectedCell, setSelectedCell ] = useState();

	/**
	 * Align text within the a column.
	 *
	 * @param {string} align The new alignment to apply to the column.
	 */
	function onChangeColumnAlignment( textAlign ) {
		if ( ! selectedCell ) {
			return;
		}

		// Convert the cell selection to a column selection so that alignment
		// is applied to the entire column.
		const columnSelection = {
			type: 'column',
			columnIndex: selectedCell.columnIndex
		};

		const newAttributes = updateSelectedCell(
			attributes,
			columnSelection,
			( cellAttributes ) => ({
				...cellAttributes,
				textAlign
			})
		);
		setAttributes( newAttributes );
	}

	/**
	 * Get the alignment of the currently selected cell.
	 *
	 * @return {string} The new alignment to apply to the column.
	 */
	function getCellAlignment() {
		if ( ! selectedCell ) {
			return;
		}

		return getCellAttribute( attributes, selectedCell, 'textAlign' );
	}

	/**
	 * Inserts a row at the currently selected row index, plus `delta`.
	 *
	 * @param {number} delta Offset for selected row index at which to insert.
	 */
	function onInsertRow( delta ) {
		if ( ! selectedCell ) {
			return;
		}

		const { sectionName, rowIndex } = selectedCell;
		const newRowIndex = rowIndex + delta;

		setAttributes(
			insertRow( attributes, {
				sectionName,
				rowIndex: newRowIndex
			})
		);

		// Select the first cell of the new row
		setSelectedCell({
			sectionName,
			rowIndex: newRowIndex,
			columnIndex: 0,
			type: 'cell'
		});
	}

	/**
	 * Inserts a row before the currently selected row.
	 */
	function onInsertRowBefore() {
		onInsertRow( 0 );
	}

	/**
	 * Inserts a row after the currently selected row.
	 */
	function onInsertRowAfter() {
		onInsertRow( 1 );
	}

	/**
	 * Deletes the currently selected row.
	 */
	function onDeleteRow() {
		if ( ! selectedCell ) {
			return;
		}

		const { sectionName, rowIndex } = selectedCell;

		setSelectedCell();
		setAttributes( deleteRow( attributes, { sectionName, rowIndex }) );
	}

	/**
	 * Inserts a column at the currently selected column index, plus `delta`.
	 *
	 * @param {number} delta Offset for selected column index at which to insert.
	 */
	function onInsertColumn( delta = 0 ) {
		if ( ! selectedCell ) {
			return;
		}

		const { columnIndex } = selectedCell;
		const newColumnIndex = columnIndex + delta;

		setAttributes(
			insertColumn( attributes, {
				columnIndex: newColumnIndex
			})
		);

		// Select the first cell of the new column
		setSelectedCell({
			rowIndex: 0,
			columnIndex: newColumnIndex,
			type: 'cell'
		});
	}

	/**
	 * Inserts a column before the currently selected column.
	 */
	function onInsertColumnBefore() {
		onInsertColumn( 0 );
	}

	/**
	 * Inserts a column after the currently selected column.
	 */
	function onInsertColumnAfter() {
		onInsertColumn( 1 );
	}

	/**
	 * Deletes the currently selected column.
	 */
	function onDeleteColumn() {
		if ( ! selectedCell ) {
			return;
		}

		const { sectionName, columnIndex } = selectedCell;

		setSelectedCell();
		setAttributes(
			deleteColumn( attributes, { sectionName, columnIndex })
		);
	}

	useEffect( () => {
		if ( ! isSelected ) {
			setSelectedCell();
		}
	}, [ isSelected ]);

	const sections = [ 'head', 'body', 'foot' ].filter(
		( name ) => ! isEmptyTableSection( attributes[ name ])
	);

	const tableControls = [
		{
			icon: tableRowBefore,
			title: __( 'Insert row before', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertRowBefore
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertRowAfter
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onDeleteRow
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertColumnBefore
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertColumnAfter
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onDeleteColumn
		}
	];

	const isEmpty = ! sections.length;

	return (
		<figure { ...useBlockProps() }>
			{ isEmpty && (
				<TablePlaceholder {...{ setAttributes }} />
			) }
			{ ! isEmpty && (
				<>
					<BlockControls group="block">
						<AlignmentControl
							label={ __( 'Change column alignment', 'flexible-table-block' ) }
							alignmentControls={ ALIGNMENT_CONTROLS }
							value={ getCellAlignment() }
							onChange={ ( nextAlign ) =>
								onChangeColumnAlignment( nextAlign )
							}
						/>
					</BlockControls>
					<BlockControls group="other">
						<ToolbarDropdownMenu
							hasArrowIndicator
							icon={ table }
							label={ __( 'Edit table', 'flexible-table-block' ) }
							controls={ tableControls }
						/>
					</BlockControls>
					<InspectorControls>
						<TableControls {...{ attributes, setAttributes }} />
						<CaptionControls {...{ attributes, setAttributes }} />
						<CellsControls {...{ attributes, setAttributes }} />
					</InspectorControls>
					{ 'top' === captionSide && <TableCaption {...{ attributes, setAttributes, insertBlocksAfter }} /> }
					<Table {...{ attributes, setAttributes, selectedCell, setSelectedCell }} />
					{ 'bottom' === captionSide && <TableCaption {...{ attributes, setAttributes, insertBlocksAfter }} /> }
				</>
			) }
		</figure>
	);
}

export default TableEdit;
