/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';

export default function TableCaption({
	attributes,
	setAttributes,
	insertBlocksAfter
}) {
	const { caption, captionAlign, captionFontSize } = attributes;

	const onChange = ( value ) => {
		setAttributes({ caption: value });
	};

	return (
		<RichText
			tagName="figcaption"
			className={
				classnames({
					[ `has-text-align-${captionAlign}` ]: captionAlign
				})
			}
			style={{ fontSize: captionFontSize }}
			aria-label={ __( 'Table caption text', 'flexible-table-block' ) }
			placeholder={ __( 'Add caption', 'flexible-table-block' ) }
			value={ caption }
			onChange={ onChange }
			__unstableOnSplitAtEnd={ () =>
				insertBlocksAfter( createBlock( 'core/paragraph' ) )
			}
		/>
	);
}
