/**
 * External dependencies
 */
import classnames from 'classnames';
import type { Properties } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { InspectorControls, BlockControls, useBlockProps } from '@wordpress/block-editor';
import {
	// @ts-ignore: has no exported member
	ToolbarDropdownMenu,
	PanelBody,
} from '@wordpress/components';
import {
	blockTable,
	justifyLeft,
	tableColumnAfter,
	tableColumnBefore,
	tableColumnDelete,
	tableRowAfter,
	tableRowBefore,
	tableRowDelete,
} from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import { CONTENT_JUSTIFY_CONTROLS } from './constants';
import { STORE_NAME, type StoreOptions } from './store';
import { TableSettings, TableCaptionSettings, TableCellSettings } from './settings';
import { Table, TablePlaceholder, TableCaption } from './elements';
import {
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	mergeCells,
	splitMergedCells,
	hasMergedCells,
	isRectangleSelected,
	toTableAttributes,
	toVirtualTable,
	isEmptySection,
	type VTable,
	type VSelectedLine,
	type VSelectedCells,
} from './utils/table-state';
import { convertToObject } from './utils/style-converter';
import { mergeCell, splitCell } from './icons';
import type { BlockAttributes, SectionName, ContentJustifyValue } from './BlockAttributes';

function TableEdit( props: BlockEditProps< BlockAttributes > ) {
	const {
		attributes,
		setAttributes,
		isSelected,
		// @ts-ignore: `insertBlocksAfter` prop is not exist at @types
		insertBlocksAfter,
	} = props;
	const { contentJustification, tableStyles, captionStyles, captionSide } = attributes;
	const [ selectedCells, setSelectedCells ] = useState< VSelectedCells >( undefined );
	const [ selectedLine, setSelectedLine ] = useState< VSelectedLine >( undefined );

	const tableStylesObj: Properties = convertToObject( tableStyles );
	const captionStylesObj: Properties = convertToObject( captionStyles );
	const options: StoreOptions = useSelect(
		( select ) =>
			select( STORE_NAME )
				// @ts-ignore
				.getOptions(),
		[]
	);
	const { createWarningNotice } = useDispatch( noticesStore );

	// Release cell selection.
	useEffect( () => {
		if ( ! isSelected ) {
			setSelectedCells( undefined );
			setSelectedLine( undefined );
		}
	}, [ isSelected ] );

	// Create virtual table object with the cells placed in positions based on how they actually look.
	const vTable: VTable = toVirtualTable( attributes );

	const onChangeContentJustification = ( value: ContentJustifyValue ) => {
		const newValue = contentJustification === value ? undefined : value;
		setAttributes( { contentJustification: newValue } );
	};

	const onInsertRow = ( offset: number ) => {
		if ( ! selectedCells || selectedCells.length !== 1 ) {
			return;
		}

		const { sectionName, rowIndex, rowSpan } = selectedCells[ 0 ];

		// Calculate row index to be inserted considering rowspan of the selected cell.
		const insertRowIndex = offset === 0 ? rowIndex : rowIndex + offset + rowSpan - 1;

		const newVTable = insertRow( vTable, { sectionName, rowIndex: insertRowIndex } );

		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onDeleteRow = () => {
		if ( ! selectedCells || selectedCells.length !== 1 ) {
			return;
		}

		const { sectionName, rowIndex } = selectedCells[ 0 ];

		// Do not allow tbody to be empty for table with thead /tfoot sections.
		if (
			sectionName === 'body' &&
			vTable.body.length === 1 &&
			( ! isEmptySection( vTable.head ) || ! isEmptySection( vTable.foot ) )
		) {
			createWarningNotice(
				__( 'The table body must have one or more rows.', 'flexible-table-block' ),
				{
					id: 'flexible-table-block-body-row',
					type: 'snackbar',
				}
			);
			return;
		}

		const newVTable = deleteRow( vTable, { sectionName, rowIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onInsertColumn = ( offset: number ) => {
		if ( ! selectedCells || selectedCells.length !== 1 ) {
			return;
		}

		const { vColIndex, colSpan } = selectedCells[ 0 ];

		// Calculate column index to be inserted considering colspan of the selected cell.
		const insertVColIndex = offset === 0 ? vColIndex : vColIndex + offset + colSpan - 1;

		const newVTable = insertColumn( vTable, { vColIndex: insertVColIndex } );

		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onDeleteColumn = () => {
		if ( ! selectedCells || selectedCells.length !== 1 ) {
			return;
		}

		const { vColIndex } = selectedCells[ 0 ];

		const newVTable = deleteColumn( vTable, { vColIndex } );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onMergeCells = () => {
		const newVTable = mergeCells( vTable, selectedCells, options.merge_content );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
	};

	const onSplitMergedCells = () => {
		const newVTable = splitMergedCells( vTable, selectedCells );
		setAttributes( toTableAttributes( newVTable ) );
		setSelectedCells( undefined );
		setSelectedLine( undefined );
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
			title: __( 'Split merged cells', 'flexible-table-block' ),
			isDisabled: ! selectedCells || ! hasMergedCells( selectedCells ),
			onClick: () => onSplitMergedCells(),
		},
		{
			icon: mergeCell,
			title: __( 'Merge cells', 'flexible-table-block' ),
			isDisabled: ! selectedCells || ! isRectangleSelected( selectedCells ),
			onClick: () => onMergeCells(),
		},
	] as const;

	const isEmpty: boolean = ! [ 'head', 'body', 'foot' ].filter(
		( sectionName ) => ! isEmptySection( vTable[ sectionName as SectionName ] )
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
		attributes,
		setAttributes,
		isSelected,
		options,
		vTable,
		tableStylesObj,
		selectedCells,
		setSelectedCells,
		selectedLine,
		setSelectedLine,
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

	const tableCellSettingsLabel: string =
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
					<BlockControls
						// @ts-ignore: `group` prop is not exist at @types
						group="block"
					>
						<ToolbarDropdownMenu
							label={ __( 'Change table justification', 'flexible-table-block' ) }
							icon={
								( contentJustification &&
									TableJustifyControls.find( ( control ) => control.value === contentJustification )
										?.icon ) ||
								justifyLeft
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
							title={ __( 'Table settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<TableSettings { ...tableSettingsProps } />
						</PanelBody>
						{ selectedCells && !! selectedCells.length && (
							<PanelBody title={ tableCellSettingsLabel } initialOpen={ false }>
								<TableCellSettings { ...tableCellSettingsProps } />
							</PanelBody>
						) }
						<PanelBody
							title={ __( 'Caption settings', 'flexible-table-block' ) }
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
