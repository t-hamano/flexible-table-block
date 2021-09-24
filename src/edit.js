/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
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

import { TableSettings, TableCaptionSettings, TableCellSettings } from './settings';
import { Table, TablePlaceholder, TableCaption } from './elements';

import { insertRow, deleteRow, insertColumn, deleteColumn } from './utils/table-state';
import { isEmptyTableSection } from './utils/helper';
import { convertToObject } from './utils/style-converter';
import { mergeCell, splitCell } from './icons';

const JUSTIFY_CONTROLS = [ 'left', 'center', 'right' ];

function TableEdit( props ) {
	const { attributes, setAttributes, isSelected, insertBlocksAfter } = props;
	const { contentJustification, tableStyles, captionStyles, captionSide } = attributes;
	const [ selectedCell, setSelectedCell ] = useState();
	const [ selectedMultiCell, setSelectedMultiCell ] = useState();
	const [ selectedRangeCell, setSelectedRangeCell ] = useState();
	const [ selectedLine, setSelectedLine ] = useState();

	const tableStylesObj = convertToObject( tableStyles );
	const captionStylesObj = convertToObject( captionStyles );

	const options = useSelect( ( select ) => {
		return select( STORE_NAME ).getOptions();
	} );

	const onInsertRow = ( { sectionName, rowIndex, offset } ) => {
		setAttributes(
			insertRow( attributes, {
				sectionName,
				rowIndex: rowIndex + offset,
			} )
		);

		setSelectedCell();
		setSelectedMultiCell();
		setSelectedRangeCell();
		setSelectedLine();
	};

	const onDeleteRow = ( { sectionName, rowIndex } ) => {
		setAttributes( deleteRow( attributes, { sectionName, rowIndex } ) );

		setSelectedCell();
		setSelectedMultiCell();
		setSelectedRangeCell();
		setSelectedLine();
	};

	const onInsertColumn = ( { sectionName, columnIndex, offset } ) => {
		const newColumnIndex = columnIndex + offset;

		setAttributes(
			insertColumn( attributes, {
				sectionName,
				columnIndex: newColumnIndex,
			} )
		);

		setSelectedCell();
		setSelectedMultiCell();
		setSelectedRangeCell();
		setSelectedLine();
	};

	const onDeleteColumn = ( columnIndex ) => {
		setAttributes( deleteColumn( attributes, { columnIndex } ) );

		setSelectedCell();
		setSelectedMultiCell();
		setSelectedRangeCell();
		setSelectedLine();
	};

	useEffect( () => {
		if ( ! isSelected ) {
			setSelectedCell();
			setSelectedLine();
		}
	}, [ isSelected ] );

	const TableToolbarControls = [
		{
			icon: tableRowBefore,
			title: __( 'Insert row before', 'flexible-table-block' ),
			isDisabled: ! selectedCell || selectedMultiCell || selectedRangeCell,
			onClick: () => {
				const { sectionName, rowIndex } = selectedCell;
				onInsertRow( { sectionName, rowIndex, offset: 0 } );
			},
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled: ! selectedCell || selectedMultiCell || selectedRangeCell,
			onClick: () => {
				const { sectionName, rowIndex } = selectedCell;
				onInsertRow( { sectionName, rowIndex, offset: 1 } );
			},
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-table-block' ),
			isDisabled: ! selectedCell || selectedMultiCell || selectedRangeCell,
			onClick: () => {
				const { sectionName, rowIndex } = selectedCell;
				onDeleteRow( { sectionName, rowIndex } );
			},
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-table-block' ),
			isDisabled: ! selectedCell || selectedMultiCell || selectedRangeCell,
			onClick: () => {
				const { columnIndex } = selectedCell;
				onInsertColumn( { columnIndex, offset: 0 } );
			},
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled: ! selectedCell || selectedMultiCell || selectedRangeCell,
			onClick: () => {
				const { columnIndex } = selectedCell;
				onInsertColumn( { columnIndex, offset: 1 } );
			},
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled: ! selectedCell || selectedMultiCell || selectedRangeCell,
			onClick: () => {
				const { columnIndex } = selectedCell;
				onDeleteColumn( columnIndex );
			},
		},
		{
			icon: splitCell,
			title: __( 'Split Merged Cells', 'flexible-table-block' ),
			// isDisabled:
			// 	! selectedCell ||
			// 	( selectedCell && ! selectedCell.rowSpan && ! selectedCell.colSpan ) ||
			// 	selectedRangeCell ||
			// 	selectedMultiCell,
			onClick: () => {},
		},
		{
			icon: mergeCell,
			title: __( 'Merge Cells', 'flexible-table-block' ),
			// isDisabled: ! selectedMultiCell,
			onClick: () => {},
		},
	];

	const filteredSections = [ 'head', 'body', 'foot' ].filter(
		( name ) => ! isEmptyTableSection( attributes[ name ] )
	);

	const isEmpty = ! filteredSections.length;

	const tablePlaceholderProps = useBlockProps();

	const tableFigureProps = useBlockProps( {
		className: classnames( {
			[ `is-content-justification-${ contentJustification }` ]: contentJustification,
			'show-dot-on-th': options.show_dot_on_th && isSelected,
		} ),
		style: {
			paddingTop: isSelected && options.show_control_button ? '40px' : undefined,
			paddingLeft: isSelected && options.show_control_button ? '40px' : undefined,
		},
	} );

	const tableProps = {
		...props,
		options,
		filteredSections,
		tableStylesObj,
		selectedCell,
		setSelectedCell,
		selectedMultiCell,
		setSelectedMultiCell,
		selectedRangeCell,
		setSelectedRangeCell,
		selectedLine,
		setSelectedLine,
		onInsertRow,
		onDeleteRow,
		onInsertColumn,
		onDeleteColumn,
	};

	const tableSettingProps = {
		...props,
		tableStylesObj,
	};

	const tableCellSettingProps = {
		...props,
		selectedCell,
		setSelectedCell,
	};

	const tableCaptionProps = {
		...props,
		captionStylesObj,
		insertBlocksAfter,
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
							hasArrowIndicator
							icon={ table }
							label={ __( 'Edit table', 'flexible-table-block' ) }
							controls={ TableToolbarControls }
						/>
					</BlockControls>
					<InspectorControls>
						<PanelBody
							title={ __( 'Table Settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<TableSettings { ...tableSettingProps } />
						</PanelBody>
						<PanelBody
							title={ __( 'Cell Settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<TableCellSettings { ...tableCellSettingProps } />
						</PanelBody>
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
