/**
 * External dependencies
 */
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { ColorPalette, Popover as ComponentsPopover } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { Popover, VisuallyHidden } from '@wordpress/ui';
import { useSettings } from '@wordpress/block-editor';

type Color = {
	name: string;
	slug: string;
	color: Property.Color;
};

type Props = {
	label: string;
	value: Property.Color | undefined;
	onChange: ( value: Property.Color | undefined ) => void;
	onClose: () => void;
	colors?: Color[];
	anchor?: Element | null;
};

export default function ColorPalettePopover( {
	label,
	value,
	onChange,
	onClose,
	colors: colorsProp = [],
	anchor,
}: Props ) {
	const [ palette ]: ( Color[] | undefined )[] = useSettings( 'color.palette' );
	const slotName = useInstanceId( ColorPalettePopover, 'ftb-color-palette-popover-slot' );

	const handleOnOpenChange = ( open: boolean ) => {
		if ( ! open ) {
			onClose();
		}
	};

	return (
		<Popover.Root open onOpenChange={ handleOnOpenChange }>
			<Popover.Popup
				className="ftb-color-palette-popover"
				positioner={
					<Popover.Positioner
						anchor={ anchor ?? undefined }
						side="left"
						align="start"
						sideOffset={ 36 }
					/>
				}
			>
				<VisuallyHidden render={ <Popover.Title /> }>{ label }</VisuallyHidden>
				{ /* Match the width of the color popover in block supports, which fits six swatches (28px) and five gaps (12px) per row. */ }
				<div style={ { width: '228px' } }>
					{ /*
					 * Render the custom color picker inside this popover. Otherwise it is rendered
					 * in a different place (e.g. inside the global settings dialog), where it is
					 * clipped by the dialog and hidden behind this popover.
					 */ }
					<ComponentsPopover.__unstableSlotNameProvider value={ slotName }>
						<ColorPalette
							colors={ [ ...( palette ?? [] ), ...colorsProp ] }
							value={ value || '' }
							onChange={ onChange }
						/>
					</ComponentsPopover.__unstableSlotNameProvider>
				</div>
				<ComponentsPopover.Slot name={ slotName } />
			</Popover.Popup>
		</Popover.Root>
	);
}
