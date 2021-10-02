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
	isMultiSelected,
	isRangeSelected,
	isEmptyTableSection,
	toVirtualSection,
} from './utils/helper';
import { convertToObject } from './utils/style-converter';
import { mergeCell, splitCell } from './icons';

function TableEdit( props ) {
	const { attributes, setAttributes, isSelected } = props;
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

	// Reset the selection state of matrices and cells when the focus is off the block.
	useEffect( () => {
		if ( ! isSelected ) {
			setSelectedCell();
			setSelectedMultiCell();
			setSelectedRangeCell();
			setSelectedLine();
		}
	}, [ isSelected ] );

	// Reset the selection state of matrices and cells when the state of a matrix or cell changes.
	useEffect( () => {
		setSelectedCell();
		setSelectedMultiCell();
		setSelectedRangeCell();
		setSelectedLine();
	}, [ attributes.head, attributes.body, attributes.foot ] );

	// Reset the selection state of cells when the state of selected line changes.
	useEffect( () => {
		setSelectedCell();
		setSelectedMultiCell();
		setSelectedRangeCell();
	}, [ selectedLine ] );

	const onInsertRow = ( offset ) => {
		if ( ! selectedCell ) return;

		const { sectionName, rowIndex, rowSpan } = selectedCell;

		// Calculate row index to be inserted considering rowspan of the selected cell.
		const insertRowIndex =
			offset === 0 ? rowIndex : rowIndex + offset + ( rowSpan ? parseInt( rowSpan ) - 1 : 0 );

		setAttributes(
			insertRow( attributes, {
				sectionName,
				rowIndex: insertRowIndex,
			} )
		);
	};

	const onDeleteRow = () => {
		if ( ! selectedCell ) return;

		const { sectionName, rowIndex, rowSpan } = selectedCell;

		// Calculate row index to be deleted considering rowspan of the selected cell.
		const deleteRowIndex = rowSpan ? rowIndex + parseInt( rowSpan ) - 1 : rowIndex;

		setAttributes(
			deleteRow( attributes, {
				sectionName,
				rowIndex: deleteRowIndex,
			} )
		);
	};

	const onInsertColumn = ( offset ) => {
		if ( ! selectedCell ) return;

		const { sectionName, colSpan } = selectedCell;

		// Create virtual section array with the cells placed in positions based on how they actually look.
		const vSection = toVirtualSection( attributes, { sectionName, selectedCell } );

		if ( ! vSection ) return;

		// The selected cell column index on the virtual section.
		const vSelectedCell = vSection
			.reduce( ( cells, row ) => {
				return cells.concat( row );
			}, [] )
			.filter( ( cell ) => cell.isSelected )[ 0 ];

		// Calculate column index to be inserted considering colspan of the selected cell.
		const insertVColIndex =
			offset === 0
				? vSelectedCell.vColIndex
				: vSelectedCell.vColIndex + offset + ( colSpan ? parseInt( colSpan ) - 1 : 0 );

		setAttributes(
			insertColumn( attributes, {
				vColIndex: insertVColIndex,
			} )
		);
	};

	const onDeleteColumn = ( colIndex ) => {
		setAttributes( deleteColumn( attributes, { colIndex } ) );
	};

	const onMergeCells = () => {
		setAttributes( mergeCells( attributes, { selectedRangeCell } ) );
	};

	const onSplitMergedCells = () => {
		setAttributes( splitMergedCells( attributes, { selectedCell } ) );
	};

	const TableToolbarControls = [
		{
			icon: tableRowBefore,
			title: __( 'Insert row before', 'flexible-table-block' ),
			isDisabled:
				! selectedCell ||
				isRangeSelected( selectedRangeCell ) ||
				isMultiSelected( selectedMultiCell ),
			onClick: () => {
				onInsertRow( 0 );
			},
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled:
				! selectedCell ||
				isRangeSelected( selectedRangeCell ) ||
				isMultiSelected( selectedMultiCell ),
			onClick: () => {
				onInsertRow( 1 );
			},
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-table-block' ),
			isDisabled:
				! selectedCell ||
				isRangeSelected( selectedRangeCell ) ||
				isMultiSelected( selectedMultiCell ),
			onClick: () => {
				onDeleteRow();
			},
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-table-block' ),
			isDisabled:
				! selectedCell ||
				isRangeSelected( selectedRangeCell ) ||
				isMultiSelected( selectedMultiCell ),
			onClick: () => {
				onInsertColumn( 0 );
			},
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled:
				! selectedCell ||
				isRangeSelected( selectedRangeCell ) ||
				isMultiSelected( selectedMultiCell ),
			onClick: () => {
				onInsertColumn( 1 );
			},
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled:
				! selectedCell ||
				isRangeSelected( selectedRangeCell ) ||
				isMultiSelected( selectedMultiCell ),
			onClick: () => {
				const { colIndex } = selectedCell;
				onDeleteColumn( colIndex );
			},
		},
		{
			icon: splitCell,
			title: __( 'Split Merged Cells', 'flexible-table-block' ),
			isDisabled:
				// ! selectedCell?.rowSpan ||
				// ! selectedCell?.colSpan ||
				isRangeSelected( selectedRangeCell ) || isMultiSelected( selectedMultiCell ),
			onClick: () => {
				onSplitMergedCells();
			},
		},
		{
			icon: mergeCell,
			title: __( 'Merge Cells', 'flexible-table-block' ),
			isDisabled: ! isRangeSelected( selectedRangeCell ),
			onClick: () => {
				onMergeCells();
			},
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
	};

	const tableSettingProps = {
		...props,
		tableStylesObj,
	};

	const tableCellSettingProps = {
		...props,
		selectedCell,
		selectedMultiCell,
		selectedRangeCell,
	};

	const tableCaptionProps = {
		...props,
		captionStylesObj,
		setSelectedCell,
		setSelectedMultiCell,
		setSelectedRangeCell,
		setSelectedLine,
	};

	const tableCaptionSettingProps = {
		...props,
		captionStylesObj,
	};

	const tableCellSettingsLabel =
		isRangeSelected( selectedRangeCell ) || isMultiSelected( selectedMultiCell )
			? __( 'Multi Cells Settings', 'flexible-table-block' )
			: __( 'Cell Settings', 'flexible-table-block' );

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
							<TableSettings { ...tableSettingProps } />
						</PanelBody>
						{ ( selectedCell || selectedMultiCell || selectedRangeCell ) && (
							<PanelBody title={ tableCellSettingsLabel } initialOpen={ false }>
								<TableCellSettings { ...tableCellSettingProps } />
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
