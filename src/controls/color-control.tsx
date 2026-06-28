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
import { useState } from '@wordpress/element';
import {
	BaseControl,
	Popover,
	ColorPalette,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { Stack } from '@wordpress/ui';
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

	const colors = useSelect( ( select ) => {
		const settings = select(
			blockEditorStore
			// @ts-ignore
		).getSettings();
		return settings?.colors ?? [];
	}, [] );

	const [ isPickerOpen, setIsPickerOpen ] = useState( false );

	const handleOnChange = ( inputValue: Property.Color | undefined ) => onChange( inputValue );

	const handleOnPickerOpen = () => setIsPickerOpen( true );

	const handleOnPickerClose = () => setIsPickerOpen( false );

	return (
		<BaseControl
			className={ clsx( 'ftb-color-control', className ) }
			help={ help }
			id={ instanceId }
			label={ label }
		>
			<Stack direction="column" gap="sm" role="group" id={ instanceId }>
				<ColorIndicatorButton
					label={ __( 'Color', 'flexible-table-block' ) }
					value={ value }
					onClick={ handleOnPickerOpen }
					isNone={ ! value }
					isTransparent={ value === 'transparent' }
				/>
			</Stack>
			{ isPickerOpen && (
				<Popover placement="left-start" shift offset={ 36 } onClose={ handleOnPickerClose }>
					<Spacer padding={ 4 } marginBottom={ 0 }>
						<ColorPalette
							colors={ [ ...colors, ...colorsProp ] }
							value={ value || '' }
							onChange={ handleOnChange }
						/>
					</Spacer>
				</Popover>
			) }
		</BaseControl>
	);
}
