/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	InspectorControls,
	BlockControls,
	useBlockProps,
	useBlockEditingMode,
} from '@wordpress/block-editor';
import { ToolbarDropdownMenu, PanelBody } from '@wordpress/components';
import { Text } from '@wordpress/ui';
import {
	blockTable,
	justifyLeft,
	tableRowAfter,
	tableRowBefore,
	tableColumnBefore,
	tableColumnAfter,
	tableColumnDelete,
	tableRowDelete,
} from '@wordpress/icons';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import { CONTENT_JUSTIFY_CONTROLS } from './constants';
import { STORE_NAME, type StoreOptions } from './store';
import { TableSettings, TableCaptionSettings, TableCellSettings, GlobalSettings } from './settings';
import { Table, TablePlaceholder, TableCaption } from './elements';
import {
	mergeCells,
	splitMergedCells,
	hasMergedCells,
	isRectangleSelected,
	toVirtualTable,
	isEmptySection,
	type VTable,
	type VSelectedLine,
	type VSelectedCells,
} from './utils/table-state';
import { convertToObject } from './utils/style-converter';
import { useTableOperations } from './hooks';
import { tableMergeCell, tableSplitCell } from './icons';
import type { BlockAttributes, SectionName, ContentJustifyValue } from './BlockAttributes';

function TableEdit( props: BlockEditProps< BlockAttributes > ) {
	const {
		attributes,
		setAttributes,
		isSelected: isSingleSelected,
		// @ts-expect-error `insertBlocksAfter` is missing from the type definitions.
		insertBlocksAfter,
	} = props;
	const { contentJustification, tableStyles, captionStyles, captionSide } = attributes;
	const [ selectedCells, setSelectedCells ] = useState< VSelectedCells >( undefined );
	const [ selectedLine, setSelectedLine ] = useState< VSelectedLine >( undefined );

	const tableStylesObj = convertToObject( tableStyles );
	const captionStylesObj = convertToObject( captionStyles );
	const options = useSelect( ( select ) => {
		const { getOptions }: { getOptions: () => StoreOptions } = select( STORE_NAME );
		return getOptions();
	}, [] );
	const blockEditingMode = useBlockEditingMode();
	const isContentOnlyMode = blockEditingMode === 'contentOnly';

	// Release cell selection.
	useEffect( () => {
		if ( ! isSingleSelected ) {
			setSelectedCells( undefined );
			setSelectedLine( undefined );
		}
	}, [ isSingleSelected ] );

	// Create virtual table object with the cells placed in positions based on how they actually look.
	const vTable: VTable = toVirtualTable( attributes );

	const { updateTable, onInsertRow, onDeleteRow, onInsertColumn, onDeleteColumn } =
		useTableOperations( { vTable, setAttributes, setSelectedCells, setSelectedLine } );

	const onChangeContentJustification = ( value: ContentJustifyValue ) => {
		const newValue = contentJustification === value ? undefined : value;
		setAttributes( { contentJustification: newValue } );
	};

	// Row and column operations from the toolbar require exactly one selected cell.
	const selectedCell = selectedCells?.length === 1 ? selectedCells[ 0 ] : undefined;

	const onMergeCells = () => {
		updateTable( mergeCells( vTable, selectedCells, options.merge_content ) );
	};

	const onSplitMergedCells = () => {
		updateTable( splitMergedCells( vTable, selectedCells ) );
	};

	const TableJustifyControls = CONTENT_JUSTIFY_CONTROLS.map( ( { icon, label, value } ) => ( {
		icon,
		title: label,
		isActive: contentJustification === value,
		value,
		onClick: () => onChangeContentJustification( value ),
	} ) );

	const TableEditControls = [
		{
			icon: tableRowBefore,
			title: __( 'Insert row before', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => selectedCell && onInsertRow( selectedCell, 0 ),
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => selectedCell && onInsertRow( selectedCell, 1 ),
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => selectedCell && onDeleteRow( selectedCell.sectionName, selectedCell.rowIndex ),
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => selectedCell && onInsertColumn( selectedCell, 0 ),
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => selectedCell && onInsertColumn( selectedCell, 1 ),
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => selectedCell && onDeleteColumn( selectedCell.vColIndex ),
		},
		{
			icon: tableSplitCell,
			title: __( 'Split merged cells', 'flexible-table-block' ),
			isDisabled: ! selectedCells || ! hasMergedCells( selectedCells ),
			onClick: () => onSplitMergedCells(),
		},
		{
			icon: tableMergeCell,
			title: __( 'Merge cells', 'flexible-table-block' ),
			isDisabled: ! selectedCells || ! isRectangleSelected( selectedCells ),
			onClick: () => onMergeCells(),
		},
	];

	const isEmpty = ! [ 'head', 'body', 'foot' ].filter(
		( sectionName ) => ! isEmptySection( vTable[ sectionName as SectionName ] )
	).length;

	const tablePlaceholderProps = useBlockProps();

	const tableFigureProps = useBlockProps( {
		className: clsx( `is-caption-side-${ captionSide }`, {
			[ `is-content-justification-${ contentJustification }` ]: contentJustification,
			'show-dot-on-th': options.show_dot_on_th,
			'show-control-button': options.show_control_button,
			'is-content-only': isContentOnlyMode,
		} ),
	} );

	const tableProps = {
		attributes,
		setAttributes,
		isSelected: isSingleSelected,
		options,
		vTable,
		tableStylesObj,
		selectedCells,
		setSelectedCells,
		selectedLine,
		setSelectedLine,
		isContentOnlyMode,
	};

	const tableSettingsProps = {
		attributes,
		setAttributes,
		vTable,
		setSelectedCells,
		setSelectedLine,
		tableStylesObj,
	};

	const tableCellSettingsProps = {
		setAttributes,
		vTable,
		selectedCells,
	};

	const tableCellSettingsLabel =
		selectedCells && selectedCells.length > 1
			? __( 'Multi cells settings', 'flexible-table-block' )
			: __( 'Cell settings', 'flexible-table-block' );

	const tableCaptionProps = {
		attributes,
		setAttributes,
		insertBlocksAfter,
		setSelectedLine,
		setSelectedCells,
		captionStylesObj,
		isSelected: isSingleSelected,
	};

	const tableCaptionSettingProps = {
		attributes,
		setAttributes,
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
					{ ! isContentOnlyMode && (
						<>
							<BlockControls group="block">
								<ToolbarDropdownMenu
									label={ __( 'Change table justification', 'flexible-table-block' ) }
									icon={
										( contentJustification &&
											TableJustifyControls.find(
												( control ) => control.value === contentJustification
											)?.icon ) ||
										justifyLeft
									}
									controls={ TableJustifyControls }
								/>
								<ToolbarDropdownMenu
									label={ __( 'Edit table', 'flexible-table-block' ) }
									icon={ blockTable }
									controls={ TableEditControls }
								/>
							</BlockControls>
						</>
					) }
					<InspectorControls>
						<PanelBody
							title={ __( 'Global setting', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<GlobalSettings />
						</PanelBody>
						<PanelBody
							title={ __( 'Table settings', 'flexible-table-block' ) }
							initialOpen={ false }
							className="flexible-table-block-table-settings-panel"
						>
							<TableSettings { ...tableSettingsProps } />
						</PanelBody>
						<PanelBody
							title={ tableCellSettingsLabel }
							initialOpen={ false }
							className="flexible-table-block-table-cell-settings-panel"
						>
							{ selectedCells && !! selectedCells.length ? (
								<TableCellSettings { ...tableCellSettingsProps } />
							) : (
								<Text>{ __( 'No cells selected.', 'flexible-table-block' ) }</Text>
							) }
						</PanelBody>
						<PanelBody
							title={ __( 'Caption settings', 'flexible-table-block' ) }
							initialOpen={ false }
							className="flexible-table-block-table-caption-settings-panel"
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
