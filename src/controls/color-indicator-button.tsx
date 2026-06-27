/**
 * External dependencies
 */
import clsx from 'clsx';
import type { ComponentProps } from 'react';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { Button, ColorIndicator } from '@wordpress/components';
import { forwardRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

type Props = {
	label: string;
	value?: Property.Color;
	isNone: boolean;
	isTransparent: boolean;
	isMixed?: boolean;
} & Omit< ComponentProps< 'button' >, 'value' | 'children' >;

const ColorIndicatorButton = forwardRef< HTMLButtonElement, Props >(
	function ColorIndicatorButtonRender(
		{ label, value, isNone, isTransparent, isMixed = false, className, ...rest },
		ref
	) {
		return (
			<Button
				ref={ ref }
				label={ label }
				className={ clsx(
					'ftb-color-indicator-button',
					{
						'is-none': isNone,
						'is-mixed': isMixed,
						'is-transparent': isTransparent,
					},
					className
				) }
				{ ...rest }
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
);

export default ColorIndicatorButton;
