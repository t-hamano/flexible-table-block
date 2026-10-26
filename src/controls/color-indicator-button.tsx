/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { Button, ColorIndicator } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

type Props = {
	label: string;
	value?: Property.Color;
	isNone: boolean;
	isTransparent: boolean;
	isMixed?: boolean;
	isExpanded?: boolean;
	showTooltip?: boolean;
	onClick: () => void;
};

export default function ColorIndicatorButton( {
	label,
	value,
	isNone,
	isTransparent,
	isMixed = false,
	isExpanded = false,
	showTooltip,
	onClick,
}: Props ) {
	let description: string;
	if ( isMixed ) {
		description = __( 'Mixed', 'flexible-table-block' );
	} else if ( isNone ) {
		description = __( 'No color selected', 'flexible-table-block' );
	} else if ( isTransparent ) {
		description = __( 'Transparent', 'flexible-table-block' );
	} else {
		description = value || '';
	}

	return (
		<Button
			label={ label }
			showTooltip={ showTooltip }
			describedBy={ description }
			aria-expanded={ isExpanded }
			className={ clsx( 'ftb-color-indicator-button', {
				'is-none': isNone,
				'is-mixed': isMixed,
				'is-transparent': isTransparent,
			} ) }
			onClick={ onClick }
		>
			{ isMixed ? (
				<span aria-hidden="true">{ __( 'Mixed', 'flexible-table-block' ) }</span>
			) : (
				<ColorIndicator
					colorValue={ value || '' }
					className="ftb-color-indicator-button__indicator"
				/>
			) }
		</Button>
	);
}
