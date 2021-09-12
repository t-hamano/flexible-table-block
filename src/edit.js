/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { InspectorControls, BlockControls, useBlockProps } from '@wordpress/block-editor';
import { ToolbarDropdownMenu, PanelBody } from '@wordpress/components';
import {
	tableColumnAfter,
	tableColumnBefore,
	tableColumnDelete,
	tableRowAfter,
	tableRowBefore,
	tableRowDelete,
	table,
} from '@wordpress/icons';

/**
 * Internal components
 */
import TableSettings from './settings/table-settings';
import CaptionSettings from './settings/caption-settings';
import CellsSettings from './settings/cells-settings';

import Table from './components/table';
import TablePlaceholder from './components/table-placeholder';
import TableCaption from './components/table-caption';

/**
 * Internal dependencies
 */
import './editor.scss';
import { insertRow, deleteRow, insertColumn, deleteColumn } from './utils/state';
import { parseInlineStyles, isEmptyTableSection } from './utils/helper';

function TableEdit( props ) {
	const { attributes, setAttributes, isSelected } = props;

	const { tableStyles, captionSide } = attributes;

	const [ selectedCell, setSelectedCell ] = useState();

	const tableStylesObj = parseInlineStyles( tableStyles );

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
				rowIndex: newRowIndex,
			} )
		);

		// Select the first cell of the new row
		setSelectedCell( {
			sectionName,
			rowIndex: newRowIndex,
			columnIndex: 0,
			type: 'cell',
		} );
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
		setAttributes( deleteRow( attributes, { sectionName, rowIndex } ) );
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
				columnIndex: newColumnIndex,
			} )
		);

		// Select the first cell of the new column
		setSelectedCell( {
			rowIndex: 0,
			columnIndex: newColumnIndex,
			type: 'cell',
		} );
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
		setAttributes( deleteColumn( attributes, { sectionName, columnIndex } ) );
	}

	useEffect( () => {
		if ( ! isSelected ) {
			setSelectedCell();
		}
	}, [ isSelected ] );

	const sections = [ 'head', 'body', 'foot' ].filter(
		( name ) => ! isEmptyTableSection( attributes[ name ] )
	);

	const TableToolbarControls = [
		{
			icon: tableRowBefore,
			title: __( 'Insert row before', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertRowBefore,
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertRowAfter,
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onDeleteRow,
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertColumnBefore,
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertColumnAfter,
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onDeleteColumn,
		},
	];

	const isEmpty = ! sections.length;

	const tableProps = {
		...props,
		tableStylesObj,
		selectedCell,
		setSelectedCell,
	};

	const tableSettingProps = {
		...props,
		tableStylesObj,
		selectedCell,
		setSelectedCell,
	};

	return (
		<figure { ...useBlockProps() }>
			{ isEmpty && <TablePlaceholder { ...props } /> }
			{ ! isEmpty && (
				<>
					<BlockControls group="block">
						<ToolbarDropdownMenu
							hasArrowIndicator
							icon={ table }
							label={ __( 'Edit table', 'flexible-table-block' ) }
							controls={ TableToolbarControls }
						/>
					</BlockControls>
					<InspectorControls>
						<PanelBody
							title={ __( 'Table Settings', 'flexible-table-block' ) }
							initialOpen={ true }
						>
							<TableSettings { ...tableProps } />
						</PanelBody>
						<PanelBody
							title={ __( 'Caption Settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<CaptionSettings { ...props } />
						</PanelBody>
						<CellsSettings { ...props } />
					</InspectorControls>
					{ 'top' === captionSide && <TableCaption { ...props } /> }
					<Table { ...tableSettingProps } />
					{ 'bottom' === captionSide && <TableCaption { ...props } /> }
				</>
			) }
		</figure>
	);
}

export default TableEdit;
