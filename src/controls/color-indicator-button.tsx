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
	id?: string;
	'aria-labelledby'?: string;
	value?: Property.Color;
	isNone: boolean;
	isTransparent: boolean;
	isMixed?: boolean;
	onClick: () => void;
};

export default function ColorIndicatorButton( {
	label,
	id,
	'aria-labelledby': ariaLabelledby,
	value,
	isNone,
	isTransparent,
	isMixed = false,
	onClick,
}: Props ) {
	return (
		<Button
			label={ label }
			id={ id }
			aria-labelledby={ ariaLabelledby }
			className={ clsx( 'ftb-color-indicator-button', {
				'is-none': isNone,
				'is-mixed': isMixed,
				'is-transparent': isTransparent,
			} ) }
			onClick={ onClick }
		>
			{ isMixed ? (
				__( 'Mixed', 'flexible-table-block' )
			) : (
				<ColorIndicator
					colorValue={ value || '' }
					className="ftb-color-indicator-button__indicator"
				/>
			) }
		</Button>
	);
}
