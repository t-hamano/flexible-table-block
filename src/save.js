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
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { getTableStyle } from './helper';

export default function save({ attributes }) {
	const {
		hasFixedLayout,
		sticky,
		width,
		minWidth,
		maxWidth,
		head,
		body,
		foot,
		captionSide,
		caption
	} = attributes;
	const isEmpty = ! head.length && ! body.length && ! foot.length;

	if ( isEmpty ) {
		return null;
	}

	const colorProps = getColorClassesAndStyles( attributes );

	const classes = classnames( colorProps.className, {
		'has-fixed-layout': hasFixedLayout,
		[ `is-sticky-${sticky}` ]: 'none' !== sticky
	});

	const hasCaption = ! RichText.isEmpty( caption );

	const tableStyle = getTableStyle( attributes );

	const Section = ({ type, rows }) => {
		if ( ! rows.length ) {
			return null;
		}

		const Tag = `t${ type }`;

		return (
			<Tag>
				{ rows.map( ({ cells }, rowIndex ) => (
					<tr key={ rowIndex }>
						{ cells.map(
							({ content, tag, textAlign }, cellIndex ) => {
								const cellClasses = classnames({
									[ `has-text-align-${ textAlign }` ]: textAlign
								});

								return (
									<RichText.Content
										className={
											cellClasses ?
												cellClasses :
												undefined
										}
										data-text-align={ textAlign }
										tagName={ tag }
										value={ content }
										key={ cellIndex }
									/>
								);
							}
						) }
					</tr>
				) ) }
			</Tag>
		);
	};

	return (
		<figure { ...useBlockProps.save() }>
			{ hasCaption && 'top' === captionSide && (
				<RichText.Content tagName="figcaption" value={ caption } />
			) }
			<table
				className={ '' === classes ? undefined : classes }
				style={ { ...tableStyle, ...colorProps.style } }
			>
				<Section type="head" rows={ head } />
				<Section type="body" rows={ body } />
				<Section type="foot" rows={ foot } />
			</table>
			{ hasCaption && 'bottom' === captionSide && (
				<RichText.Content tagName="figcaption" value={ caption } />
			) }
		</figure>
	);
}
