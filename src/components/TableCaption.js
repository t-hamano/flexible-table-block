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
	const { caption } = attributes;

	return (
		<RichText
			tagName="figcaption"
			aria-label={ __( 'Table caption text', 'flexible-spacer-block' ) }
			placeholder={ __( 'Add caption', 'flexible-spacer-block' ) }
			value={ caption }
			onChange={ ( value ) =>
				setAttributes({ caption: value })
			}
			__unstableOnSplitAtEnd={ () =>
				insertBlocksAfter( createBlock( 'core/paragraph' ) )
			}
		/>
	);
}
