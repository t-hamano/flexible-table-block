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
import {
	insertRow,
	insertColumn,
	deleteRow,
	deleteColumn,
	updateSelectedCell,
} from '../utils/table-state';
import { CELL_ARIA_LABEL, SECTION_PLACEHOLDER } from './constants';
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
	} = props;

	const { hasFixedLayout, isStackedOnMobile, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	function onInsertRow( { sectionName, rowIndex, offset } ) {
		const newRowIndex = rowIndex + offset;

		setAttributes(
			insertRow( attributes, {
				sectionName,
				rowIndex: newRowIndex,
			} )
		);
		setSelectedLine();
	}

	function onInsertColumn( { sectionName, columnIndex, offset } ) {
		const newColumnIndex = columnIndex + offset;

		setAttributes(
			insertColumn( attributes, {
				sectionName,
				columnIndex: newColumnIndex,
			} )
		);
		setSelectedLine();
	}

	function onDeleteRow( { sectionName, rowIndex } ) {
		setAttributes( deleteRow( attributes, { sectionName, rowIndex } ) );
		setSelectedCell();
		setSelectedLine();
	}

	function onDeleteColumn( columnIndex ) {
		setAttributes( deleteColumn( attributes, { columnIndex } ) );
		setSelectedCell();
		setSelectedLine();
	}

	const onChange = ( content ) => {
		if ( ! selectedCell ) return;

		setAttributes(
			updateSelectedCell( attributes, selectedCell, ( cellAttributes ) => ( {
				...cellAttributes,
				content,
			} ) )
		);
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
									{ cells.map( ( { content, tag }, columnIndex ) => (
										<Cell name={ tag } key={ columnIndex }>
											{ isSelected &&
												options.show_label_on_section &&
												rowIndex === 0 &&
												columnIndex === 0 && (
													<Button
														className="ftb-table-cell__label"
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
													{ sectionIndex === 0 && rowIndex === 0 && columnIndex === 0 && (
														<ButtonColumnBeforeInserter
															label={ __( 'Insert column before', 'flexible-table-block' ) }
															icon={ plus }
															iconSize="18"
															onClick={ () => {
																onInsertColumn( { sectionName, columnIndex, offset: 0 } );
															} }
														/>
													) }
													{ sectionIndex === 0 && rowIndex === 0 && (
														<>
															<ButtonColumnAfterInserter
																label={ __( 'Insert column after', 'flexible-table-block' ) }
																icon={ plus }
																iconSize="18"
																onClick={ () => {
																	onInsertColumn( { sectionName, columnIndex, offset: 1 } );
																} }
															/>
															<ButtonColumnSelector
																label={ __( 'Select column', 'flexible-table-block' ) }
																icon={ moreHorizontal }
																iconSize="18"
																variant={
																	selectedLine?.direction === 'column' &&
																	selectedLine?.columnIndex === columnIndex
																		? 'primary'
																		: undefined
																}
																onClick={ () => {
																	setSelectedLine( { direction: 'column', columnIndex } );
																} }
															>
																{ selectedLine?.direction === 'column' &&
																	selectedLine?.columnIndex === columnIndex && (
																		<Popover focusOnMount="false" position="top right">
																			<ButtonDeleter
																				label={ __( 'Delete column', 'flexible-table-block' ) }
																				icon={ trash }
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
													{ rowIndex === 0 && columnIndex === 0 && (
														<ButtonRowBeforeInserter
															label={ __( 'Insert row before', 'flexible-table-block' ) }
															icon={ plus }
															iconSize="18"
															hasPrevSection={ sectionIndex > 0 }
															onClick={ () => {
																onInsertRow( { sectionName, rowIndex, offset: 0 } );
															} }
														/>
													) }
													{ columnIndex === 0 && (
														<>
															<ButtonRowAfterInserter
																label={ __( 'Insert row after', 'flexible-table-block' ) }
																icon={ plus }
																iconSize="18"
																hasNextSection={
																	sectionIndex < section.length - 1 && rowIndex === row.length - 1
																}
																onClick={ () => {
																	onInsertRow( { sectionName, rowIndex, offset: 1 } );
																} }
															/>
															<ButtonRowSelector
																label={ __( 'Select row', 'flexible-table-block' ) }
																icon={ moreVertical }
																iconSize="18"
																variant={
																	selectedLine?.direction === 'row' &&
																	selectedLine?.sectionName === sectionName &&
																	selectedLine?.rowIndex === rowIndex
																		? 'primary'
																		: undefined
																}
																onClick={ () => {
																	setSelectedLine( { direction: 'row', sectionName, rowIndex } );
																} }
															>
																{ selectedLine?.direction === 'row' &&
																	selectedLine?.sectionName === sectionName &&
																	selectedLine?.rowIndex === rowIndex && (
																		<Popover focusOnMount="false" position="top left">
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
												</>
											) }
											<RichText
												key={ columnIndex }
												value={ content }
												onChange={ onChange }
												unstableOnFocus={ () => {
													setSelectedLine();
													setSelectedCell( {
														sectionName,
														rowIndex,
														columnIndex,
														type: 'cell',
													} );
												} }
												aria-label={ CELL_ARIA_LABEL[ sectionName ] }
												placeholder={ SECTION_PLACEHOLDER[ sectionName ] }
											/>
										</Cell>
									) ) }
								</tr>
							) ) }
						</TSection>
					);
				} ) }
			</table>
		</>
	);
}
