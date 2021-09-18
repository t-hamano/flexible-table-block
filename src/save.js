/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { convertToObject } from './utils/style-converter';

export default function save( { attributes } ) {
	const {
		tableStyles,
		hasFixedLayout,
		isStackedOnMobile,
		isScrollOnPc,
		isScrollOnMobile,
		sticky,
		head,
		body,
		foot,
		caption,
		captionSide,
		captionFontSize,
		captionAlign,
	} = attributes;

	const isEmpty = ! head.length && ! body.length && ! foot.length;

	if ( isEmpty ) {
		return null;
	}

	const tableStylesObj = convertToObject( tableStyles );

	const colorProps = getColorClassesAndStyles( attributes );

	const blockProps = useBlockProps.save( {
		className: classnames( {
			'is-scroll-on-pc': isScrollOnPc,
			'is-scroll-on-mobile': isScrollOnMobile,
		} ),
	} );

	const tableClasses = classnames( colorProps.className, {
		'has-fixed-layout': hasFixedLayout,
		'is-stacked-on-mobile': isStackedOnMobile,
		[ `is-sticky-${ sticky }` ]: sticky,
	} );

	const hasCaption = ! RichText.isEmpty( caption );

	const Section = ( { type, rows } ) => {
		if ( ! rows.length ) {
			return null;
		}

		const Tag = `t${ type }`;

		return (
			<Tag>
				{ rows.map( ( { cells }, rowIndex ) => (
					<tr key={ rowIndex }>
						{ cells.map( ( { content, tag, textAlign }, cellIndex ) => {
							const cellClasses = classnames( {
								[ `has-text-align-${ textAlign }` ]: textAlign,
							} );

							return (
								<RichText.Content
									className={ cellClasses ? cellClasses : undefined }
									data-text-align={ textAlign }
									tagName={ tag }
									value={ content }
									key={ cellIndex }
								/>
							);
						} ) }
					</tr>
				) ) }
			</Tag>
		);
	};

	const Caption = () => {
		return (
			<RichText.Content
				data-align={ captionAlign }
				tagName="figcaption"
				value={ caption }
				style={ { fontSize: captionFontSize } }
			/>
		);
	};

	return (
		<figure { ...blockProps }>
			{ hasCaption && 'top' === captionSide && <Caption /> }
			<table
				className={ '' === tableClasses ? undefined : tableClasses }
				style={ { ...tableStylesObj, ...colorProps.style } }
			>
				<Section type="head" rows={ head } />
				<Section type="body" rows={ body } />
				<Section type="foot" rows={ foot } />
			</table>
			{ hasCaption && 'bottom' === captionSide && <Caption /> }
		</figure>
	);
}
