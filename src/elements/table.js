/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { RichText, __experimentalUseColorProps as useColorProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { updateSelectedCell } from '../utils/table-state';
import { CELL_ARIA_LABEL, SECTION_PLACEHOLDER } from './constants';

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
		attributes,
		setAttributes,
		tableStylesObj,
		isSelected,
		selectedCell,
		setSelectedCell,
	} = props;

	const { hasFixedLayout, sticky } = attributes;

	const colorProps = useColorProps( attributes );

	const onChange = ( content ) => {
		if ( ! selectedCell ) {
			return;
		}

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
					[ `is-sticky-${ sticky }` ]: sticky,
				} ) }
				style={ { ...tableStylesObj, ...colorProps.style } }
			>
				{ [ 'head', 'body', 'foot' ].map( ( name ) => {
					return (
						<TSection name={ name } key={ name }>
							{ attributes[ name ].map( ( { cells }, rowIndex ) => (
								<tr key={ rowIndex }>
									{ cells.map( ( { content, tag, textAlign }, columnIndex ) => (
										<Cell name={ tag } key={ name }>
											<RichText
												key={ columnIndex }
												className={ classnames( {
													[ `has-text-align-${ textAlign }` ]: textAlign,
												} ) }
												value={ content }
												onChange={ onChange }
												unstableOnFocus={ () => {
													setSelectedCell( {
														sectionName: name,
														rowIndex,
														columnIndex,
														type: 'cell',
													} );
												} }
												aria-label={ CELL_ARIA_LABEL[ name ] }
												placeholder={ SECTION_PLACEHOLDER[ name ] }
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
