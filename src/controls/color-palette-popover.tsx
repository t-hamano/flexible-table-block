/**
 * External dependencies
 */
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { ColorPalette } from '@wordpress/components';
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

	const handleOnOpenChange = ( open: boolean ) => {
		if ( ! open ) {
			onClose();
		}
	};

	return (
		<Popover.Root open onOpenChange={ handleOnOpenChange }>
			<Popover.Popup
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
					<ColorPalette
						colors={ [ ...( palette ?? [] ), ...colorsProp ] }
						value={ value || '' }
						onChange={ onChange }
					/>
				</div>
			</Popover.Popup>
		</Popover.Root>
	);
}
