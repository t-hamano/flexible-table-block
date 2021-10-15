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
import { InspectorControls, BlockControls, useBlockProps } from '@wordpress/block-editor';
import { ToolbarDropdownMenu, PanelBody } from '@wordpress/components';
import {
	blockTable,
	justifyLeft,
	justifyCenter,
	justifyRight,
	tableColumnAfter,
	tableColumnBefore,
	tableColumnDelete,
	tableRowAfter,
	tableRowBefore,
	tableRowDelete,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './editor.scss';
import { STORE_NAME } from './store';
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
	toTableAttributes,
	isEmptySection,
	isRectangleSelected,
	hasMergedCells,
} from './utils/helper';
import { convertToObject } from './utils/style-converter';
import { mergeCell, splitCell } from './icons';

const justifyIcons = {
	left: justifyLeft,
	center: justifyCenter,
	right: justifyRight,
};

function TableEdit( props ) {
	const { attributes, setAttributes } = props;
	const { contentJustification, tableStyles, captionStyles, captionSide } = attributes;
	const [ selectedCells, setSelectedCells ] = useState();
	const [ selectedLine, setSelectedLine ] = useState();
	const [ selectMode, setSelectMode ] = useState();

	const tableStylesObj = convertToObject( tableStyles );
	const captionStylesObj = convertToObject( captionStyles );

	const options = useSelect( ( select ) => select( STORE_NAME ).getOptions() );

	// Create virtual table object with the cells placed in positions based on how they actually look.
	const vTable = toVirtualTable( attributes );

	// Monitor pressed key to determine whether multi-select mode or range select mode.
	const onKeyDown = ( event ) => {
		if ( event.shiftKey ) {
			setSelectMode( 'range' );
		} else if ( event.ctrlKey || event.metakey ) {
			setSelectMode( 'multi' );
		}
	};

	const onKeyUp = () => {
		setSelectMode();
	};

	const onChangeContentJustification = ( value ) => {
		const newValue = contentJustification === value ? undefined : value;
		setAttributes( { contentJustification: newValue } );
	};

	const onInsertRow = ( offset ) => {
		if ( ( selectedCells || [] ).length !== 1 ) return;

		const { sectionName, rowIndex, rowSpan } = selectedCells[ 0 ];

		// Calculate row index to be inserted considering rowspan of the selected cell.
		const insertRowIndex =
			offset === 0 ? rowIndex : rowIndex + offset + ( rowSpan ? parseInt( rowSpan ) - 1 : 0 );

		const newVTable = insertRow( vTable, { sectionName, rowIndex: insertRowIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteRow = () => {
		if ( ( selectedCells || [] ).length !== 1 ) return;

		const { sectionName, rowIndex } = selectedCells[ 0 ];

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

		const newVTable = deleteRow( vTable, { sectionName, rowIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onInsertColumn = ( offset ) => {
		if ( ( selectedCells || [] ).length !== 1 ) return;

		const { vColIndex, colSpan } = selectedCells[ 0 ];

		// Calculate column index to be inserted considering colspan of the selected cell.
		const insertVColIndex =
			offset === 0 ? vColIndex : vColIndex + offset + ( colSpan ? parseInt( colSpan ) - 1 : 0 );

		const newVTable = insertColumn( vTable, { vColIndex: insertVColIndex } );

		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onDeleteColumn = () => {
		if ( ( selectedCells || [] ).length !== 1 ) return;

		const { vColIndex } = selectedCells[ 0 ];

		const newVTable = deleteColumn( vTable, { vColIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onMergeCells = () => {
		const newVTable = mergeCells( vTable, { selectedCells } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const onSplitMergedCells = () => {
		const newVTable = splitMergedCells( vTable, { selectedCells } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells();
		setSelectedLine();
	};

	const TableJustifyControls = [
		{
			icon: justifyLeft,
			title: __( 'Justify table left', 'flexible-table-block' ),
			isActive: contentJustification === 'left',
			onClick: () => onChangeContentJustification( 'left' ),
		},
		{
			icon: justifyCenter,
			title: __( 'Justify table center', 'flexible-table-block' ),
			isActive: contentJustification === 'center',
			onClick: () => onChangeContentJustification( 'center' ),
		},
		{
			icon: justifyRight,
			title: __( 'Justify table right', 'flexible-table-block' ),
			isActive: contentJustification === 'right',
			onClick: () => onChangeContentJustification( 'right' ),
		},
	];

	const TableEditControls = [
		{
			icon: tableRowBefore,
			title: __( 'Insert row before', 'flexible-table-block' ),
			isDisabled: ( selectedCells || [] ).length !== 1,
			onClick: () => onInsertRow( 0 ),
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled: ( selectedCells || [] ).length !== 1,
			onClick: () => onInsertRow( 1 ),
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-table-block' ),
			isDisabled: ( selectedCells || [] ).length !== 1,
			onClick: () => onDeleteRow(),
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-table-block' ),
			isDisabled: ( selectedCells || [] ).length !== 1,
			onClick: () => onInsertColumn( 0 ),
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled: ( selectedCells || [] ).length !== 1,
			onClick: () => onInsertColumn( 1 ),
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled: ( selectedCells || [] ).length !== 1,
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
		selectMode,
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
		selectedCells,
	};

	const tableCellSettingsLabel =
		( selectedCells || [] ).length > 1
			? __( 'Multi Cells Settings', 'flexible-table-block' )
			: __( 'Cell Settings', 'flexible-table-block' );

	const tableCaptionProps = {
		...props,
		captionStylesObj,
		setSelectedLine,
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
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
				<figure { ...tableFigureProps } tabIndex="-1" onKeyDown={ onKeyDown } onKeyUp={ onKeyUp }>
					<BlockControls group="block">
						<ToolbarDropdownMenu
							label={ __( 'Change table justification', 'flexible-table-block' ) }
							icon={
								contentJustification ? justifyIcons[ contentJustification ] : justifyIcons.left
							}
							controls={ TableJustifyControls }
							hasArrowIndicator
						/>
						<ToolbarDropdownMenu
							label={ __( 'Edit table', 'flexible-table-block' ) }
							icon={ blockTable }
							controls={ TableEditControls }
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
						{ !! ( selectedCells || [] ).length && (
							<PanelBody title={ tableCellSettingsLabel } initialOpen={ false }>
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
