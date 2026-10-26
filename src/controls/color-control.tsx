/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { BaseControl, Popover, ColorPalette } from '@wordpress/components';
import { Stack } from '@wordpress/ui';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ColorIndicatorButton from './color-indicator-button';

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
	const colors = useSelect( ( select ) => {
		const settings = select( blockEditorStore ).getSettings();
		return settings?.colors ?? [];
	}, [] );

	const [ isPickerOpen, setIsPickerOpen ] = useState( false );

	const handleOnChange = ( inputValue: Property.Color | undefined ) => onChange( inputValue );

	const handleOnPickerOpen = () => setIsPickerOpen( true );

	const handleOnPickerClose = () => setIsPickerOpen( false );

	return (
		<BaseControl className={ clsx( 'ftb-color-control', className ) } help={ help }>
			<Stack direction="column" gap="sm">
				<BaseControl.VisualLabel>{ label }</BaseControl.VisualLabel>
				<ColorIndicatorButton
					label={ label }
					showTooltip={ false }
					value={ value }
					onClick={ handleOnPickerOpen }
					isNone={ ! value }
					isTransparent={ value === 'transparent' }
					isExpanded={ isPickerOpen }
				/>
			</Stack>
			{ isPickerOpen && (
				<Popover placement="left-start" shift offset={ 36 } onClose={ handleOnPickerClose }>
					<div style={ { padding: '16px' } }>
						<ColorPalette
							colors={ [ ...colors, ...colorsProp ] }
							value={ value || '' }
							onChange={ handleOnChange }
						/>
					</div>
				</Popover>
			) }
		</BaseControl>
	);
}
