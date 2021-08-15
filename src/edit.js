/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';

import {
	InspectorControls,
	BlockControls,
	RichText,
	BlockIcon,
	AlignmentControl,
	useBlockProps,
	__experimentalUseColorProps as useColorProps
} from '@wordpress/block-editor';

import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	ButtonGroup,
	PanelBody,
	Placeholder,
	SelectControl,
	TextControl,
	ToggleControl,
	ToolbarDropdownMenu,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits
} from '@wordpress/components';

import {
	blockTable as icon,
	tableColumnAfter,
	tableColumnBefore,
	tableColumnDelete,
	tableRowAfter,
	tableRowBefore,
	tableRowDelete,
	table
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './editor.scss';

import {
	createTable,
	updateSelectedCell,
	getCellAttribute,
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
	toggleSection,
	isEmptyTableSection
} from './state';

import {
	previewTable,
	getTableStyle
} from './helper';

import {
	BORDER_SPACING_MAX,
	ALIGNMENT_CONTROLS,
	BORDER_COLLAPSE_CONTROLS,
	STICKY_CONTROLS,
	CELL_ARIA_LABEL,
	SECTION_PLACEHOLDER
} from './constants';

function TSection({ name, ...props }) {
	const TagName = `t${ name }`;
	return <TagName { ...props } />;
}

function TableEdit({
	attributes,
	setAttributes,
	isSelected
}) {
	const {
		hasFixedLayout,
		sticky,
		borderCollapse,
		borderSpacingHorizontal,
		borderSpacingVertical,
		captionSide,
		caption,
		head,
		foot
	} = attributes;
	const [ initialRowCount, setInitialRowCount ] = useState( 2 );
	const [ initialColumnCount, setInitialColumnCount ] = useState( 2 );
	const [ initialHeaderSection, setInitialHeaderSection ] = useState( false );
	const [ initialFooterSection, setInitialFooterSection ] = useState( false );
	const [ selectedCell, setSelectedCell ] = useState();

	const colorProps = useColorProps( attributes );

	const units = useCustomUnits({
		availableUnits: [ 'px', 'em', 'rem' ]
	});

	/**
	 * Updates the initial column count used for table creation.
	 *
	 * @param {number} count New initial column count.
	 */
	function onChangeInitialColumnCount( count ) {
		setInitialColumnCount( count );
	}

	/**
	 * Updates the initial row count used for table creation.
	 *
	 * @param {number} count New initial row count.
	 */
	function onChangeInitialRowCount( count ) {
		setInitialRowCount( count );
	}

	/**
	 * Updates the initial header section setting used for table creation.
	 *
	 * @param {boolean} hasHeader New initial header section setting.
	 */
	function onToggleInitialHeaderSection( hasHeader ) {
		setInitialHeaderSection( hasHeader );
	}

	/**
	 * Updates the initial footer section setting used for table creation.
	 *
	 * @param {boolean} hasFooter New initial footer section setting.
	 */
	function onToggleInitialFooterSection( hasFooter ) {
		setInitialFooterSection( hasFooter );
	}

	/**
	 * Creates a table based on dimensions in local state.
	 *
	 * @param {Object} event Form submit event.
	 */
	function onCreateTable( event ) {
		event.preventDefault();

		setAttributes(
			createTable({
				rowCount: parseInt( initialRowCount, 10 ) || 2,
				columnCount: parseInt( initialColumnCount, 10 ) || 2,
				hasHeader: !! initialHeaderSection,
				hasFooter: !! initialFooterSection
			})
		);
	}

	/**
	 * Toggles whether the table has a fixed layout or not.
	 */
	function onChangeFixedLayout() {
		setAttributes({ hasFixedLayout: ! hasFixedLayout });
	}

	/**
	 * Toggles whether the table has a fixed layout or not.
	 */
	function onChangeSticky( value ) {
		setAttributes({ sticky: value });
	}

	/**
	 * Changes the content of the currently selected cell.
	 *
	 * @param {Array} content A RichText content value.
	 */
	function onChange( content ) {
		if ( ! selectedCell ) {
			return;
		}

		setAttributes(
			updateSelectedCell(
				attributes,
				selectedCell,
				( cellAttributes ) => ({
					...cellAttributes,
					content
				})
			)
		);
	}

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
	 * Add or remove a `head` table section.
	 */
	function onToggleHeaderSection() {
		setAttributes( toggleSection( attributes, 'head' ) );
	}

	/**
	 * Add or remove a `foot` table section.
	 */
	function onToggleFooterSection() {
		setAttributes( toggleSection( attributes, 'foot' ) );
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
			title: __( 'Insert row before', 'flexible-spacer-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertRowBefore
		},
		{
			icon: tableRowAfter,
			title: __( 'Insert row after', 'flexible-spacer-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertRowAfter
		},
		{
			icon: tableRowDelete,
			title: __( 'Delete row', 'flexible-spacer-block' ),
			isDisabled: ! selectedCell,
			onClick: onDeleteRow
		},
		{
			icon: tableColumnBefore,
			title: __( 'Insert column before', 'flexible-spacer-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertColumnBefore
		},
		{
			icon: tableColumnAfter,
			title: __( 'Insert column after', 'flexible-spacer-block' ),
			isDisabled: ! selectedCell,
			onClick: onInsertColumnAfter
		},
		{
			icon: tableColumnDelete,
			title: __( 'Delete column', 'flexible-spacer-block' ),
			isDisabled: ! selectedCell,
			onClick: onDeleteColumn
		}
	];

	const renderedSections = [ 'head', 'body', 'foot' ].map( ( name ) => (
		<TSection name={ name } key={ name } >
			{ attributes[ name ].map( ({ cells }, rowIndex ) => (
				<tr key={ rowIndex }>
					{ cells.map(
						(
							{ content, tag: CellTag, textAlign },
							columnIndex
						) => (
							<RichText
								tagName={ CellTag }
								key={ columnIndex }
								className={ classnames(
									{
										[ `has-text-align-${ textAlign }` ]: textAlign
									}
								) }
								value={ content }
								onChange={ onChange }
								unstableOnFocus={ () => {
									setSelectedCell({
										sectionName: name,
										rowIndex,
										columnIndex,
										type: 'cell'
									});
								} }
								aria-label={ CELL_ARIA_LABEL[ name ] }
								placeholder={ SECTION_PLACEHOLDER[ name ] }
							/>
						)
					) }
				</tr>
			) ) }
		</TSection>
	) );

	const isEmpty = ! sections.length;

	const tableStyle = getTableStyle( attributes );

	return (
		<figure { ...useBlockProps() }>
			{ ! isEmpty && (
				<>
					<BlockControls group="block">
						<AlignmentControl
							label={ __( 'Change column alignment', 'flexible-spacer-block' ) }
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
							label={ __( 'Edit table', 'flexible-spacer-block' ) }
							controls={ tableControls }
						/>
					</BlockControls>
					<InspectorControls>
						<PanelBody
							title={ __( 'Table Settings', 'flexible-spacer-block' ) }
						>
							<ToggleControl
								label={ __( 'Fixed width table cells', 'flexible-spacer-block' ) }
								checked={ !! hasFixedLayout }
								onChange={ onChangeFixedLayout }
							/>
							<ToggleControl
								label={ __( 'Header section', 'flexible-spacer-block' ) }
								checked={ !! ( head && head.length ) }
								onChange={ onToggleHeaderSection }
							/>
							<ToggleControl
								label={ __( 'Footer section', 'flexible-spacer-block' ) }
								checked={ !! ( foot && foot.length ) }
								onChange={ onToggleFooterSection }
							/>
							<SelectControl
								label={ __( 'Fixed control', 'flexible-spacer-block' ) }
								value={ sticky }
								onChange={ onChangeSticky }
								options={ STICKY_CONTROLS.map( ({ label, value }) => {
									return { label, value };
								}) }
							/>
							<BaseControl
								label={ __( 'Cell borders', 'flexible-spacer-block' ) }
								id="flexible-table-block/cell-borders"
							>
								<ButtonGroup
									className="wp-block-ftb-flexible-table__components-button-group"
								>
									{ BORDER_COLLAPSE_CONTROLS.map( ({ label, value }) => {
										return (
											<Button
												key={ value }
												isPrimary= { value === borderCollapse }
												onClick={ () =>{
													setAttributes({ borderCollapse: value });
													setAttributes({ borderSpacingHorizontal: '0' });
													setAttributes({ borderSpacingVertical: '0' });
												} }
											>
												{ label }
											</Button>
										);
									}) }
								</ButtonGroup>
							</BaseControl>
							{ 'separate' === borderCollapse && (
								<BaseControl
									label={ __( 'Distance between the borders', 'flexible-spacer-block' ) }
									id="flexible-table-block/padding"
								>
									<div className="wp-block-ftb-flexible-table__spacing-control">
										<UnitControl
											label={ __( 'Horizontal', 'flexible-spacer-block' ) }
											labelPosition="top"
											min="0"
											max={ BORDER_SPACING_MAX }
											value={ borderSpacingHorizontal || '' }
											onChange={ ( value ) => {
												value = 0 > parseFloat( value ) ? '0' : value;
												setAttributes({ borderSpacingHorizontal: value });
											} }
											units={ units }
										/>
										<UnitControl
											label={ __( 'Vertical', 'flexible-spacer-block' ) }
											labelPosition="top"
											min="0"
											max={ BORDER_SPACING_MAX }
											value={ borderSpacingVertical || '' }
											onChange={ ( value ) => {
												value = 0 > parseFloat( value ) ? '0' : value;
												setAttributes({ borderSpacingVertical: value });
											} }
											units={ units }
										/>
									</div>
								</BaseControl>
							)}
							<BaseControl
								label={ __( 'Caption position', 'flexible-spacer-block' ) }
								id="flexible-table-block/caption-side"
							>
								<ButtonGroup
									className="wp-block-ftb-flexible-table__components-button-group"
								>
									{ [ 'top', 'bottom' ].map( ( positionValue ) => {
										return (
											<Button
												key={ positionValue }
												isPrimary= { positionValue === captionSide }
												onClick={ () =>
													setAttributes({ captionSide: positionValue })
												}
											>
												{ positionValue }
											</Button>
										);
									}) }
								</ButtonGroup>
							</BaseControl>
						</PanelBody>
						<PanelBody
							title={ __( 'Cells Settings', 'flexible-spacer-block' ) }
							initialOpen= { false }
						></PanelBody>
					</InspectorControls>
					{ 'top' === captionSide && (
						<RichText
							tagName="figcaption"
							aria-label={ __( 'Table caption text', 'flexible-spacer-block' ) }
							placeholder={ __( 'Add caption', 'flexible-spacer-block' ) }
							value={ caption }
							onChange={ ( value ) =>
								setAttributes({ caption: value })
							}
						/>
					)}
					<table
						className={ classnames(
							colorProps.className,
							{
								'has-fixed-layout': hasFixedLayout,
								[ `is-sticky-${sticky}` ]: 'none' !== sticky
							}
						) }
						style={ { ...tableStyle, ...colorProps.style } }
					>
						{ renderedSections }
					</table>
					{ 'bottom' === captionSide && (
						<RichText
							tagName="figcaption"
							aria-label={ __( 'Table caption text', 'flexible-spacer-block' ) }
							placeholder={ __( 'Add caption', 'flexible-spacer-block' ) }
							value={ caption }
							onChange={ ( value ) =>
								setAttributes({ caption: value })
							}
						/>
					)}
				</>
			) }
			{ isEmpty && (
				<Placeholder
					label={ __( 'Table', 'flexible-spacer-block' ) }
					icon={ <BlockIcon icon={ icon } showColors /> }
					instructions={ __( 'Insert a table for sharing data.' ) }
				>
					{
						previewTable({
							rowCount: parseInt( initialRowCount, 10 ) || 2,
							columnCount: parseInt( initialColumnCount, 10 ) || 2,
							hasHeader: !! initialHeaderSection,
							hasFooter: !! initialFooterSection
						})
					}
					<form className="wp-block-ftb-flexible-table__placeholder-form" onSubmit={ onCreateTable }>
						<div className="wp-block-ftb-flexible-table__placeholder-row">
							<ToggleControl
								label={ __( 'Header section', 'flexible-spacer-block' ) }
								checked={ !! initialHeaderSection }
								onChange={ onToggleInitialHeaderSection }
							/>
							<ToggleControl
								label={ __( 'Footer section', 'flexible-spacer-block' ) }
								checked={ !! initialFooterSection }
								onChange={ onToggleInitialFooterSection }
							/>
						</div>
						<div className="wp-block-ftb-flexible-table__placeholder-row">
							<TextControl
								type="number"
								label={ __( 'Column count', 'flexible-spacer-block' ) }
								value={ initialColumnCount }
								onChange={ onChangeInitialColumnCount }
								min="1"
							/>
							<TextControl
								type="number"
								label={ __( 'Row count', 'flexible-spacer-block' ) }
								value={ initialRowCount }
								onChange={ onChangeInitialRowCount }
								min="1"
							/>
							<Button
								isPrimary
								type="submit"
							>
								{ __( 'Create Table', 'flexible-spacer-block' ) }
							</Button>
						</div>
					</form>
				</Placeholder>
			) }
		</figure>
	);
}

export default TableEdit;
