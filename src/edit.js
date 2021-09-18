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

const JUSTIFY_CONTROLS = [ 'left', 'center', 'right' ];

function TableEdit( props ) {
	const { attributes, setAttributes, isSelected } = props;
	const {
		contentJustification,
		isScrollOnPc,
		isScrollOnMobile,
		tableStyles,
		captionSide,
	} = attributes;
	const [ selectedCell, setSelectedCell ] = useState();

	const tableStylesObj = convertToObject( tableStyles );

	const options = useSelect( ( select ) => {
		return select( STORE_NAME ).getOptions();
	} );

	function onInsertRow( offset ) {
		if ( ! selectedCell ) {
			return;
		}

		const { sectionName, rowIndex } = selectedCell;
		const newRowIndex = rowIndex + offset;

		setAttributes(
			insertRow( attributes, {
				sectionName,
				rowIndex: newRowIndex,
			} )
		);

		setSelectedCell( {
			sectionName,
			rowIndex: newRowIndex,
			columnIndex: 0,
			type: 'cell',
		} );
	}

	function onDeleteRow() {
		if ( ! selectedCell ) {
			return;
		}

		const { sectionName, rowIndex } = selectedCell;

		setSelectedCell();
		setAttributes( deleteRow( attributes, { sectionName, rowIndex } ) );
	}

	function onInsertColumn( offset = 0 ) {
		if ( ! selectedCell ) {
			return;
		}

		const { columnIndex } = selectedCell;
		const newColumnIndex = columnIndex + offset;

		setAttributes(
			insertColumn( attributes, {
				columnIndex: newColumnIndex,
			} )
		);

		setSelectedCell( {
			rowIndex: 0,
			columnIndex: newColumnIndex,
			type: 'cell',
		} );
	}

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
			onClick: () => {
				onInsertRow( 0 );
			},
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => {
				onInsertRow( 1 );
			},
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
			onClick: () => {
				onInsertColumn( 0 );
			},
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: () => {
				onInsertColumn( 1 );
			},
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-table-block' ),
			isDisabled: ! selectedCell,
			onClick: onDeleteColumn,
		},
	];

	const isEmpty = ! sections.length;

	const blockProps = useBlockProps( {
		className: classnames( {
			[ `is-content-justification-${ contentJustification }` ]: contentJustification,
			'show-label-on-section': options.show_label_on_section && isSelected,
			'show-dot-on-th': options.show_dot_on_th && isSelected,
			'is-scroll-on-pc': isScrollOnPc,
			'is-scroll-on-mobile': isScrollOnMobile,
		} ),
	} );

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
		<figure { ...blockProps }>
			{ isEmpty && <TablePlaceholder { ...props } /> }
			{ ! isEmpty && (
				<>
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
							initialOpen={ true }
						>
							<TableSettings { ...tableSettingProps } />
						</PanelBody>
						<PanelBody
							title={ __( 'Cell Settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<TableCellSettings { ...props } />
						</PanelBody>
						<PanelBody
							title={ __( 'Caption Settings', 'flexible-table-block' ) }
							initialOpen={ false }
						>
							<TableCaptionSettings { ...props } />
						</PanelBody>
					</InspectorControls>
					{ 'top' === captionSide && <TableCaption { ...props } /> }
					<Table { ...tableProps } />
					{ 'bottom' === captionSide && <TableCaption { ...props } /> }
				</>
			) }
		</figure>
	);
}

export default TableEdit;
