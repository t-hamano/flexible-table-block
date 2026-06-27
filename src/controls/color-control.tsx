/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Property } from 'csstype';
import type { ReactElement } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { BaseControl, ColorPalette } from '@wordpress/components';
import { Stack, Text, Popover, getWpCompatOverlaySlot } from '@wordpress/ui';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import ColorIndicatorButton from './color-indicator-button';

type Props = {
	label: string | ReactElement;
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
	const instanceId = useInstanceId( ColorControl, 'ftb-color-control' );
	const headingId = `${ instanceId }-heading`;

	const colors = useSelect( ( select ) => {
		const settings = select(
			blockEditorStore
			// @ts-ignore
		).getSettings();
		return settings?.colors ?? [];
	}, [] );

	const handleOnChange = ( inputValue: Property.Color | undefined ) => onChange( inputValue );

	return (
		<BaseControl className={ clsx( 'ftb-color-control', className ) } help={ help }>
			<Stack direction="column" gap="sm" aria-labelledby={ headingId } role="group">
				<Text variant="heading-sm" id={ headingId }>
					{ label }
				</Text>
				<Popover.Root>
					<Popover.Trigger
						render={
							<ColorIndicatorButton
								label={ __( 'Color', 'flexible-table-block' ) }
								value={ value }
								isNone={ ! value }
								isTransparent={ value === 'transparent' }
							/>
						}
					/>
					<Popover.Popup
						portal={ <Popover.Portal container={ getWpCompatOverlaySlot() } /> }
						positioner={ <Popover.Positioner side="left" align="start" sideOffset={ 36 } /> }
					>
						<ColorPalette
							colors={ [ ...colors, ...colorsProp ] }
							value={ value || '' }
							onChange={ handleOnChange }
						/>
					</Popover.Popup>
				</Popover.Root>
			</Stack>
		</BaseControl>
	);
}
