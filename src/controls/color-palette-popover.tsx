/**
 * External dependencies
 */
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { Popover, ColorPalette } from '@wordpress/components';
import { useSettings } from '@wordpress/block-editor';

type Color = {
	name: string;
	slug: string;
	color: Property.Color;
};

type Props = {
	value: Property.Color | undefined;
	onChange: ( value: Property.Color | undefined ) => void;
	onClose: () => void;
	colors?: Color[];
	anchor?: Element | null;
};

export default function ColorPalettePopover( {
	value,
	onChange,
	onClose,
	colors: colorsProp = [],
	anchor,
}: Props ) {
	const [ palette ]: ( Color[] | undefined )[] = useSettings( 'color.palette' );

	return (
		<Popover placement="left-start" shift offset={ 36 } onClose={ onClose } anchor={ anchor }>
			<div style={ { padding: 'var(--wpds-dimension-padding-lg)' } }>
				<ColorPalette
					colors={ [ ...( palette ?? [] ), ...colorsProp ] }
					value={ value || '' }
					onChange={ onChange }
				/>
			</div>
		</Popover>
	);
}
