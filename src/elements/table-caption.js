/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';

export default function TableCaption( props ) {
	const { captionStylesObj, attributes, setAttributes, insertBlocksAfter } = props;
	const { caption } = attributes;

	const onChange = ( value ) => {
		setAttributes( { caption: value } );
	};

	return (
		<RichText
			tagName="figcaption"
			style={ captionStylesObj }
			aria-label={ __( 'Table caption text', 'flexible-table-block' ) }
			placeholder={ __( 'Add caption', 'flexible-table-block' ) }
			value={ caption }
			onChange={ onChange }
			__unstableOnSplitAtEnd={ () => insertBlocksAfter( createBlock( 'core/paragraph' ) ) }
		/>
	);
}
