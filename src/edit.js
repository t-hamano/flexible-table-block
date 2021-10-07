/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	InspectorControls,
	BlockControls,
	JustifyContentControl,
	useBlockProps,
} from '@wordpress/block-editor';
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
 * Internal dependencies
 */
import { STORE_NAME } from './store';
import { JUSTIFY_CONTROLS } from './constants';

import { TableSettings, TableCaptionSettings, TableCellSettings } from './settings';
import { Table, TablePlaceholder, TableCaption } from './elements';

import {
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	mergeCells,
	splitMergedCells,
} from './utils/table-state';
import {
	toVirtualTable,
	isEmptySection,
	isRectangleSelected,
	hasMergedCells,
} from './utils/helper';
import { convertToObject } from './utils/style-converter';
import { mergeCell, splitCell } from './icons';

function TableEdit( props ) {
	const { attributes, setAttributes } = props;
	const { contentJustification, tableStyles, captionStyles, captionSide } = attributes;
	const [ selectedCell, setSelectedCell ] = useState();
	const [ selectedCells, setSelectedCells ] = useState();
	const [ selectedLine, setSelectedLine ] = useState();

	const tableStylesObj = convertToObject( tableStyles );
	const captionStylesObj = convertToObject( captionStyles );

	const options = useSelect( ( select ) => select( STORE_NAME ).getOptions() );

	// Create virtual table object with the cells placed in positions based on how they actually look.
	const vTable = toVirtualTable( attributes );

	const onInsertRow = ( offset ) => {
		if ( ! selectedCell ) return;

		const { sectionName, rowIndex, rowSpan } = selectedCell;

		// Calculate row index to be inserted considering rowspan of the selected cell.
		const insertRowIndex =
			offset === 0 ? rowIndex : rowIndex + offset + ( rowSpan ? parseInt( rowSpan ) - 1 : 0 );

		setAttributes( insertRow( attributes, { sectionName, rowIndex: insertRowIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteRow = () => {
		if ( ! selectedCell ) return;

		const { sectionName, rowIndex } = selectedCell;

		// Do not allow tbody to be empty for table with thead /tfoot sections.
		if (
			sectionName === 'body' &&
			vTable.body.length === 1 &&
			vTable.head.length &&
			vTable.foot.length
		) {
			// eslint-disable-next-line no-alert, no-undef
			alert( __( 'The table body must have one or more rows.', 'flexible-table-block' ) );
			return;
		}

		setAttributes( deleteRow( vTable, { sectionName, rowIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onInsertColumn = ( offset ) => {
		if ( ! selectedCell ) return;

		const { vColIndex, colSpan } = selectedCell;

		// Calculate column index to be inserted considering colspan of the selected cell.
		const insertVColIndex =
			offset === 0 ? vColIndex : vColIndex + offset + ( colSpan ? parseInt( colSpan ) - 1 : 0 );

		setAttributes( insertColumn( vTable, { vColIndex: insertVColIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteColumn = () => {
		if ( ! selectedCell ) return;

		const { vColIndex } = selectedCell;

		setAttributes( deleteColumn( vTable, { vColIndex } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onMergeCells = () => {
		setAttributes( mergeCells( vTable, { selectedCells } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const onSplitMergedCells = () => {
		setAttributes( splitMergedCells( vTable, { selectedCells } ) );
		setSelectedCell();
		setSelectedCells();
		setSelectedLine();
	};

	const TableToolbarControls = [
		{
			icon: tableRowBefore,
			title: __( 'Insert row before', 'flexible-table-block' ),
			isDisabled: ! selectedCell || ( selectedCells && selectedCells.length > 1 ),
			onClick: () => onInsertRow( 0 ),
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled: ! selectedCell || ( selectedCells && selectedCells.length > 1 ),
			onClick: () => onInsertRow( 1 ),
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-table-block' ),
			isDisabled: ! selectedCell || ( selectedCells && selectedCells.length > 1 ),
			onClick: () => onDeleteRow(),
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-table-block' ),
			isDisabled: ! selectedCell || ( selectedCells && selectedCells.length > 1 ),
			onClick: () => onInsertColumn( 0 ),
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled: ! selectedCell || ( selectedCells && selectedCells.length > 1 ),
			onClick: () => onInsertColumn( 1 ),
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled: ! selectedCell || ( selectedCells && selectedCells.length > 1 ),
			onClick: () => onDeleteColumn(),
		},
		{
			icon: splitCell,
			title: __( 'Split Merged Cells', 'flexible-table-block' ),
			isDisabled: ! selectedCells || ! hasMergedCells( selectedCells ),
			onClick: () => onSplitMergedCells(),
		},
		{
			icon: mergeCell,
			title: __( 'Merge Cells', 'flexible-table-block' ),
			isDisabled: ! selectedCells || ! isRectangleSelected( selectedCells ),
			onClick: () => onMergeCells(),
		},
	];

	const isEmpty = ! [ 'head', 'body', 'foot' ].filter(
		( sectionName ) => ! isEmptySection( vTable[ sectionName ] )
	).length;

	const tablePlaceholderProps = useBlockProps();

	const tableFigureProps = useBlockProps( {
		className: classnames( `is-caption-side-${ captionSide }`, {
			[ `is-content-justification-${ contentJustification }` ]: contentJustification,
			'show-dot-on-th': options.show_dot_on_th,
			'show-control-button': options.show_control_button,
		} ),
	} );

	const tableProps = {
		...props,
		options,
		vTable,
		tableStylesObj,
		selectedCell,
		setSelectedCell,
		selectedCells,
		setSelectedCells,
		selectedLine,
		setSelectedLine,
	};

	const tableSettingsProps = {
		...props,
		vTable,
		tableStylesObj,
	};

	const tableCellSettingsProps = {
		...props,
		vTable,
		selectedCell,
		selectedCells,
	};

	const tableCaptionProps = {
		...props,
		captionStylesObj,
		setSelectedLine,
		setSelectedCell,
		setSelectedCells,
	};

	const tableCaptionSettingProps = {
		...props,
		captionStylesObj,
	};

	return (
		<>
			{ isEmpty && (
				<div { ...tablePlaceholderProps }>
					<TablePlaceholder { ...props } />
				</div>
			) }
			{ ! isEmpty && (
				<figure { ...tableFigureProps }>
					<BlockControls group="block">
						<JustifyContentControl
							allowedControls={ JUSTIFY_CONTROLS }
							value={ contentJustification }
							onChange={ ( value ) => setAttributes( { contentJustification: value } ) }
							popoverProps={ {
								position: 'bottom right',
								isAlternate: true,
							} }
						/>
						<ToolbarDropdownMenu
							label={ __( 'Edit table', 'flexible-table-block' ) }
							icon={ table }
							controls={ TableToolbarControls }
							hasArrowIndicator
						/>
					</BlockControls>
					<InspectorControls>
						<PanelBody
							title={ __( 'Table Settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<TableSettings { ...tableSettingsProps } />
						</PanelBody>
						{ selectedCell && (
							<PanelBody
								title={ __( 'Cell Settings', 'flexible-table-block' ) }
								initialOpen={ false }
							>
								<TableCellSettings { ...tableCellSettingsProps } />
							</PanelBody>
						) }
						<PanelBody
							title={ __( 'Caption Settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<TableCaptionSettings { ...tableCaptionSettingProps } />
						</PanelBody>
					</InspectorControls>
					{ 'top' === captionSide && <TableCaption { ...tableCaptionProps } /> }
					<Table { ...tableProps } />
					{ 'bottom' === captionSide && <TableCaption { ...tableCaptionProps } /> }
				</figure>
			) }
		</>
	);
}

export default TableEdit;
