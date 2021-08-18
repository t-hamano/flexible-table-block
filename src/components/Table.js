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
import { updateSelectedCell } from '../state';
import { getTableStyle } from '../helper';
import { CELL_ARIA_LABEL, SECTION_PLACEHOLDER } from '../constants';

function TSection({ name, ...props }) {
	const TagName = `t${ name }`;
	return <TagName { ...props } />;
}

export default function Table({
	attributes,
	setAttributes,
	selectedCell,
	setSelectedCell
}) {
	const { hasFixedLayout, sticky } = attributes;

	const colorProps = useColorProps( attributes );
	const tableStyle = getTableStyle( attributes );

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

	return (
		<table
			className={ classnames(
				colorProps.className,
				{
					'has-fixed-layout': hasFixedLayout,
					[ `is-sticky-${sticky}` ]: sticky
				}
			) }
			style={ { ...tableStyle, ...colorProps.style } }
		>
			{[ 'head', 'body', 'foot' ].map( ( name ) => (
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
			) )}
		</table>
	);
}
