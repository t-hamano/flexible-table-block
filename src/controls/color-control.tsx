/**
 * External dependencies
 */
import type { Property } from 'csstype';
import type { ReactElement } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import {
	BaseControl,
	Button,
	Popover,
	ColorPalette,
	SlotFillProvider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
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
};

export default function ColorControl( {
	label = __( 'Color', 'flexible-table-block' ),
	help,
	onChange,
	colors: colorsProp = [],
	value,
}: Props ) {
	const colors = useSelect( ( select ) => {
		const settings = select(
			blockEditorStore
			// @ts-ignore
		).getSettings();
		return settings?.colors ?? [];
	}, [] );
	const instanceId = useInstanceId( ColorControl, 'ftb-color-control' );
	const headingId = `${ instanceId }-heading`;

	const [ isPickerOpen, setIsPickerOpen ] = useState< boolean >( false );

	const handleOnReset = () => onChange( undefined );

	const handleOnChange = ( inputValue: Property.Color | undefined ) => onChange( inputValue );

	const handleOnPickerOpen = () => setIsPickerOpen( true );

	const handleOnPickerClose = () => setIsPickerOpen( false );

	return (
		<SlotFillProvider>
			<BaseControl className="ftb-color-control" help={ help } __nextHasNoMarginBottom>
				<VStack aria-labelledby={ headingId } role="region">
					<HStack>
						<Text id={ headingId } upperCase size="11" weight="500">
							{ label }
						</Text>
						<Button variant="secondary" onClick={ handleOnReset } size="small">
							{ __( 'Reset', 'flexible-table-block' ) }
						</Button>
					</HStack>
					<div className="ftb-color-control__controls">
						<div className="ftb-color-control__controls-inner">
							<div className="ftb-color-control__controls-row">
								<ColorIndicatorButton
									label={ __( 'All', 'flexible-table-block' ) }
									value={ value }
									onClick={ handleOnPickerOpen }
									isNone={ ! value }
									isTransparent={ value === 'transparent' }
								/>
								{ isPickerOpen && (
									<Popover className="ftb-color-control__popover" onClose={ handleOnPickerClose }>
										<ColorPalette
											colors={ [ ...colors, ...colorsProp ] }
											value={ value || '' }
											onChange={ handleOnChange }
										/>
									</Popover>
								) }
							</div>
						</div>
					</div>
				</VStack>
				{ /* @ts-ignore Slot is not currently typed on Popover */ }
				<Popover.Slot />
			</BaseControl>
		</SlotFillProvider>
	);
}
