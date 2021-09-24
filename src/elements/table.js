/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText, __experimentalUseColorProps as useColorProps } from '@wordpress/block-editor';
import { Button, Popover } from '@wordpress/components';
import { plus, trash, moreVertical, moreHorizontal } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { CELL_ARIA_LABEL, SECTION_PLACEHOLDER } from '../constants';
import {
	ButtonRowBeforeInserter,
	ButtonRowAfterInserter,
	ButtonColumnBeforeInserter,
	ButtonColumnAfterInserter,
	ButtonRowSelector,
	ButtonColumnSelector,
	ButtonDeleter,
} from './styles';

function TSection( { name, ...props } ) {
	const TagName = `t${ name }`;
	return <TagName { ...props } />;
}

function Cell( { name, ...props } ) {
	const TagName = name;
	return <TagName { ...props } />;
}

export default function Table( props ) {
	const {
		filteredSections,
		options,
		attributes,
		setAttributes,
		tableStylesObj,
		isSelected,
		selectedCell,
		setSelectedCell,
		selectedLine,
		setSelectedLine,
		onInsertRow,
		onDeleteRow,
		onInsertColumn,
		onDeleteColumn,
	} = props;

	const { hasFixedLayout, isStackedOnMobile, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	const onChangeCellContent = ( content ) => {
		const {
			sectionName: selectedSectionName,
			rowIndex: selectedRowIndex,
			columnIndex: selectedColumnIndex,
		} = selectedCell;

		if ( ! attributes[ selectedSectionName ] ) return;

		const newSection = attributes[ selectedSectionName ].map( ( row, rowIndex ) => {
			if ( rowIndex !== selectedRowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, columnIndex ) => {
					if ( columnIndex !== selectedColumnIndex ) {
						return cell;
					}

					return {
						...cell,
						content,
					};
				} ),
			};
		} );

		setAttributes( { [ selectedSectionName ]: newSection } );
	};

	return (
		<>
			<table
				className={ classnames( colorProps.className, {
					'has-fixed-layout': hasFixedLayout,
					'is-stacked-on-mobile': isStackedOnMobile,
					[ `is-sticky-${ sticky }` ]: sticky,
				} ) }
				style={ { ...tableStylesObj, ...colorProps.style } }
			>
				{ filteredSections.map( ( sectionName, sectionIndex, section ) => {
					return (
						<TSection name={ sectionName } key={ sectionName }>
							{ attributes[ sectionName ].map( ( { cells }, rowIndex, row ) => (
								<tr key={ rowIndex }>
									{ cells.map( ( { content, tag }, columnIndex ) => {
										const cellClass = classnames( {
											'is-selected':
												selectedCell &&
												selectedCell.sectionName === sectionName &&
												selectedCell.rowIndex === rowIndex &&
												selectedCell.columnIndex === columnIndex,
										} );

										return (
											<Cell
												name={ tag }
												key={ columnIndex }
												className={ cellClass }
												onClick={ ( e ) => {
													const { keyCode } = e;
													console.log( e );
												} }
											>
												{ isSelected &&
													options.show_label_on_section &&
													rowIndex === 0 &&
													columnIndex === 0 && (
														<Button
															className="ftb-table-cell__label"
															tabIndex={ options.prevent_focus_control_button && -1 }
															variant="primary"
															onClick={ () => {
																//ここにセクション選択の処理
															} }
														>
															{ `<t${ sectionName }>` }
														</Button>
													) }
												{ isSelected && options.show_control_button && (
													<>
														{ rowIndex === 0 && columnIndex === 0 && (
															<ButtonRowBeforeInserter
																label={ __( 'Insert row before', 'flexible-table-block' ) }
																icon={ plus }
																tabIndex={ options.prevent_focus_control_button && -1 }
																iconSize="18"
																hasPrevSection={ sectionIndex > 0 }
																onClick={ () => {
																	onInsertRow( { sectionName, rowIndex, offset: 0 } );
																} }
															/>
														) }
														{ columnIndex === 0 && (
															<>
																<ButtonRowSelector
																	label={ __( 'Select row', 'flexible-table-block' ) }
																	icon={ moreVertical }
																	tabIndex={ options.prevent_focus_control_button && -1 }
																	iconSize="18"
																	variant={
																		selectedLine?.direction === 'row' &&
																		selectedLine?.sectionName === sectionName &&
																		selectedLine?.rowIndex === rowIndex
																			? 'primary'
																			: undefined
																	}
																	onClick={ () => {
																		setSelectedCell();
																		setSelectedLine( { direction: 'row', sectionName, rowIndex } );
																	} }
																>
																	{ selectedLine?.direction === 'row' &&
																		selectedLine?.sectionName === sectionName &&
																		selectedLine?.rowIndex === rowIndex && (
																			<Popover
																				focusOnMount="container"
																				position="top left"
																				onClose={ () => {
																					setSelectedLine();
																				} }
																			>
																				<ButtonDeleter
																					label={ __( 'Delete row', 'flexible-table-block' ) }
																					icon={ trash }
																					iconSize={ 20 }
																					isSmall
																					onClick={ ( event ) => {
																						onDeleteRow( { sectionName, rowIndex } );
																						event.stopPropagation();
																					} }
																				/>
																			</Popover>
																		) }
																</ButtonRowSelector>
															</>
														) }
														{ sectionIndex === 0 && rowIndex === 0 && columnIndex === 0 && (
															<ButtonColumnBeforeInserter
																label={ __( 'Insert column before', 'flexible-table-block' ) }
																icon={ plus }
																tabIndex={ options.prevent_focus_control_button && -1 }
																iconSize="18"
																onClick={ () => {
																	onInsertColumn( { sectionName, columnIndex, offset: 0 } );
																} }
															/>
														) }
														{ sectionIndex === 0 && rowIndex === 0 && (
															<>
																<ButtonColumnSelector
																	label={ __( 'Select column', 'flexible-table-block' ) }
																	icon={ moreHorizontal }
																	tabIndex={ options.prevent_focus_control_button && -1 }
																	iconSize="18"
																	variant={
																		selectedLine?.direction === 'column' &&
																		selectedLine?.columnIndex === columnIndex
																			? 'primary'
																			: undefined
																	}
																	onClick={ () => {
																		setSelectedCell();
																		setSelectedLine( { direction: 'column', columnIndex } );
																	} }
																>
																	{ selectedLine?.direction === 'column' &&
																		selectedLine?.columnIndex === columnIndex && (
																			<Popover
																				focusOnMount="container"
																				position="top center"
																				onClose={ () => {
																					setSelectedLine();
																				} }
																			>
																				<ButtonDeleter
																					label={ __( 'Delete column', 'flexible-table-block' ) }
																					icon={ trash }
																					tabIndex={ options.prevent_focus_control_button && -1 }
																					iconSize={ 20 }
																					onClick={ ( event ) => {
																						onDeleteColumn( columnIndex );
																						event.stopPropagation();
																					} }
																				/>
																			</Popover>
																		) }
																</ButtonColumnSelector>
															</>
														) }
														{ columnIndex === 0 && (
															<ButtonRowAfterInserter
																label={ __( 'Insert row after', 'flexible-table-block' ) }
																icon={ plus }
																tabIndex={ options.prevent_focus_control_button && -1 }
																iconSize="18"
																hasNextSection={
																	sectionIndex < section.length - 1 && rowIndex === row.length - 1
																}
																onClick={ () => {
																	onInsertRow( { sectionName, rowIndex, offset: 1 } );
																} }
															/>
														) }
													</>
												) }
												<RichText
													key={ columnIndex }
													value={ content }
													onChange={ onChangeCellContent }
													unstableOnFocus={ () => {
														setSelectedLine();
														setSelectedCell( {
															sectionName,
															rowIndex,
															columnIndex,
														} );
													} }
													aria-label={ CELL_ARIA_LABEL[ sectionName ] }
													placeholder={ SECTION_PLACEHOLDER[ sectionName ] }
												/>
												{ isSelected && options.show_control_button && (
													<>
														{ sectionIndex === 0 && rowIndex === 0 && (
															<ButtonColumnAfterInserter
																label={ __( 'Insert column after', 'flexible-table-block' ) }
																icon={ plus }
																tabIndex={ options.prevent_focus_control_button && -1 }
																iconSize="18"
																onClick={ () => {
																	onInsertColumn( { sectionName, columnIndex, offset: 1 } );
																} }
															/>
														) }
													</>
												) }
											</Cell>
										);
									} ) }
								</tr>
							) ) }
						</TSection>
					);
				} ) }
			</table>
		</>
	);
}
