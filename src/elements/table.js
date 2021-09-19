/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText, __experimentalUseColorProps as useColorProps } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { insertRow, insertColumn, updateSelectedCell } from '../utils/table-state';
import { CELL_ARIA_LABEL, SECTION_PLACEHOLDER } from './constants';
import {
	InserterButtonRowBefore,
	InserterButtonRowAfter,
	InserterButtonColumnBefore,
	InserterButtonColumnAfter,
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
	}

	function onInsertColumn( { sectionName, columnIndex, offset } ) {
		const newColumnIndex = columnIndex + offset;

		setAttributes(
			insertColumn( attributes, {
				sectionName,
				columnIndex: newColumnIndex,
			} )
		);
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
											{ isSelected && options.show_insert_button && (
												<>
													{ sectionIndex === 0 && rowIndex === 0 && columnIndex === 0 && (
														<InserterButtonColumnBefore
															icon={ plus }
															iconSize="18"
															label={ __( 'Insert column before', 'flexible-table-block' ) }
															onClick={ () => {
																onInsertColumn( { sectionName, columnIndex, offset: 0 } );
															} }
														/>
													) }
													{ sectionIndex === 0 && rowIndex === 0 && (
														<InserterButtonColumnAfter
															icon={ plus }
															iconSize="18"
															label={ __( 'Insert column after', 'flexible-table-block' ) }
															onClick={ () => {
																onInsertColumn( { sectionName, columnIndex, offset: 1 } );
															} }
														/>
													) }
													{ rowIndex === 0 && columnIndex === 0 && (
														<InserterButtonRowBefore
															hasPrevSection={ sectionIndex > 0 }
															icon={ plus }
															iconSize="18"
															label={ __( 'Insert row before', 'flexible-table-block' ) }
															onClick={ () => {
																onInsertRow( { sectionName, rowIndex, offset: 0 } );
															} }
														/>
													) }
													{ columnIndex === 0 && (
														<InserterButtonRowAfter
															hasNextSection={
																sectionIndex < section.length - 1 && rowIndex === row.length - 1
															}
															icon={ plus }
															iconSize="18"
															label={ __( 'Insert row after', 'flexible-table-block' ) }
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
												onChange={ onChange }
												unstableOnFocus={ () => {
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
