/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Field } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import ColorIndicatorButton from './color-indicator-button';
import ColorPalettePopover from './color-palette-popover';

type Props = {
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	colors?: {
		name: string;
		slug: string;
		color: Property.Color;
	}[];
	value: Property.Color | undefined;
	className?: string;
};

export default function ColorControl( {
	label = __( 'Color', 'flexible-table-block' ),
	help,
	onChange,
	colors: colorsProp = [],
	value,
	className,
}: Props ) {
	const [ isPickerOpen, setIsPickerOpen ] = useState( false );

	const handleOnChange = ( inputValue: Property.Color | undefined ) => onChange( inputValue );

	const handleOnPickerOpen = () => setIsPickerOpen( true );

	const handleOnPickerClose = () => setIsPickerOpen( false );

	return (
		<Field.Root className={ clsx( 'ftb-color-control', className ) }>
			<Field.VisualLabel>{ label }</Field.VisualLabel>
			<ColorIndicatorButton
				label={ label }
				value={ value }
				onClick={ handleOnPickerOpen }
				isNone={ ! value }
				isTransparent={ value === 'transparent' }
				isExpanded={ isPickerOpen }
			/>
			{ isPickerOpen && (
				<ColorPalettePopover
					value={ value }
					colors={ colorsProp }
					onChange={ handleOnChange }
					onClose={ handleOnPickerClose }
				/>
			) }
			{ help && <Field.Description>{ help }</Field.Description> }
		</Field.Root>
	);
}
