/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';

export default function TableCaption( props ) {
	const {
		captionStylesObj,
		setSelectedCell,
		setSelectedMultiCell,
		setSelectedRangeCell,
		setSelectedLine,
		insertBlocksAfter,
		attributes,
		setAttributes,
	} = props;

	const { caption } = attributes;

	const onChange = ( value ) => {
		setAttributes( { caption: value } );
	};

	return (
		<RichText
			aria-label={ __( 'Table caption text', 'flexible-table-block' ) }
			placeholder={ __( 'Add caption', 'flexible-table-block' ) }
			tagName="figcaption"
			style={ captionStylesObj }
			value={ caption }
			onChange={ onChange }
			unstableOnFocus={ () => {
				setSelectedCell();
				setSelectedMultiCell();
				setSelectedRangeCell();
				setSelectedLine();
			} }
			__unstableOnSplitAtEnd={ () => insertBlocksAfter( createBlock( 'core/paragraph' ) ) }
		/>
	);
}
