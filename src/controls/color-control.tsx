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
	// Pass the anchor explicitly so that the popover doesn't render a fallback anchor element,
	// which would add an extra gap inside the field.
	const [ popoverAnchor, setPopoverAnchor ] = useState< HTMLDivElement | null >( null );

	const handleOnChange = ( inputValue: Property.Color | undefined ) => onChange( inputValue );

	const handleOnPickerOpen = () => setIsPickerOpen( true );

	const handleOnPickerClose = () => setIsPickerOpen( false );

	return (
		<Field.Root
			ref={ setPopoverAnchor }
			className={ clsx( 'ftb-control', 'ftb-color-control', className ) }
		>
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
					anchor={ popoverAnchor }
				/>
			) }
			{ help && <Field.Description>{ help }</Field.Description> }
		</Field.Root>
	);
}
