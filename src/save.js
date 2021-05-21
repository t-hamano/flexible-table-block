import classnames from 'classnames';
import { RichText } from '@wordpress/block-editor';

export default function({ attributes, className }) {

	const {
		head,
		foot,
		hasFixedLayout,
		isStackedOnMobile,
		isScrollOnMobile,
		tableWidth,
		fontSize,
		lineHeight,
		borderColor
	} = attributes;

	const tableWidthVal = !! tableWidth ? tableWidth : undefined;
	const fontSizeVal = !! fontSize ? fontSize + 'em' : undefined;
	const lineHeightVal = !! lineHeight ? lineHeight : undefined;
	const borderColorVal = !! borderColor ? borderColor : undefined;

	const classNames = classnames(
		'hoge',
		className,
		{
			'has-fixed-layout': hasFixedLayout,
			'is-stacked-on-mobile': isStackedOnMobile,
			'is-scroll-on-mobile': isScrollOnMobile
		}
	);

	function renderSection( section ) {
		let sectionTagName = 'head' === section ? 'th' : 'td';
		return attributes[section].map( ({cells}, rowIndex ) => (
			<tr key={rowIndex}>
				{cells.map( ({content, styles, colSpan, rowSpan}, colIndex ) => (
					<RichText.Content
						tagName={sectionTagName}
						value={content}
						key={colIndex}
						style={styles}
						colSpan={colSpan}
						rowSpan={rowSpan}
					/>
				) )}
			</tr>
		) );
	}
	return (
		<div className={ classNames  } >
			<div
				className="wp-block-flexible-table-block-table__wrap"
				style={{
					width: tableWidthVal
				}}
			>
				<table
					style={{
						borderColor: borderColorVal,
						fontSize: fontSizeVal,
						lineHeight: lineHeightVal
					}}
				>
					{!! head.length && (
					<thead>{renderSection( 'head' )}</thead>
					)}
					<tbody>{renderSection( 'body' )}</tbody>
					{!! foot.length && (
						<tfoot>{renderSection( 'foot' )}</tfoot>
					)}
				</table>
			</div>
		</div>
	);
}
