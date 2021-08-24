/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { BaseControl, TabPanel } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import {
	__experimentalBorderRadiusControl as BorderRadiusControl
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import BorderStyleControl from './border-style-control';
import {
	borderAll,
	borderTop,
	borderRight,
	borderBottom,
	borderLeft
} from '../../icon';
import { parseInlineCss } from '../../utils/helper';

const BORDER_DIRECTIONS = [
	{ label: __( 'All', 'flexible-table-block' ), icon: borderAll, name: 'all' },
	{ label: __( 'Top', 'flexible-table-block' ), icon: borderTop, name: 'top' },
	{ label: __( 'Right', 'flexible-table-block' ), icon: borderRight, name: 'right' },
	{ label: __( 'Bottom', 'flexible-table-block' ), icon: borderBottom, name: 'bottom' },
	{ label: __( 'Left', 'flexible-table-block' ), icon: borderLeft, name: 'left' }
];

export default function BorderControl({ onChange, styles }) {

	const onChangeBorderStyle = ( value, direction ) => {
		console.log( value, direction );
	};


	return (
		<BaseControl
			label={ __( 'Border radius', 'flexible-table-block' ) }
			id="flexible-table-block/border"
		>
			<BorderRadiusControl
				onChange={ ( value ) =>{
					console.log( value );
				}}
			/>
		</BaseControl>
	);
}
