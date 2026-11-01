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
				<ColorPalette
					colors={ [ ...( palette ?? [] ), ...colorsProp ] }
					value={ value || '' }
					onChange={ onChange }
				/>
			</Popover.Popup>
		</Popover.Root>
	);
}
