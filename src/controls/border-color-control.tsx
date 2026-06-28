/**
 * External dependencies
 */
import clsx from 'clsx';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { BaseControl, Button, Popover, ColorPalette } from '@wordpress/components';
import { Stack } from '@wordpress/ui';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import ColorIndicatorButton from './color-indicator-button';
import { SideIndicatorControl } from './indicator-control';
import { SIDE_CONTROLS } from '../constants';
import type { SideValue } from '../BlockAttributes';

type Props = {
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	values: {
		top?: Property.BorderTopColor;
		right?: Property.BorderRightColor;
		bottom?: Property.BorderBottomColor;
		left?: Property.BorderLeftColor;
	};
	className?: string;
};

const DEFAULT_VALUES = {
	top: '',
	right: '',
	bottom: '',
	left: '',
};

export default function BorderColorControl( {
	label = __( 'Border color', 'flexible-table-block' ),
	help,
	onChange,
	values: valuesProp,
	className,
}: Props ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};
	const instanceId = useInstanceId( BorderColorControl, 'ftb-border-color-control' );

	const isMixed = ! (
		values.top === values.right &&
		values.top === values.bottom &&
		values.top === values.left
	);

	const colors = useSelect( ( select ) => {
		const settings = select(
			blockEditorStore
			// @ts-ignore
		).getSettings();
		return settings?.colors ?? [];
	}, [] );

	const [ isLinked, setIsLinked ] = useState( true );
	const [ isPickerOpen, setIsPickerOpen ] = useState( false );
	const [ pickerIndex, setPickerIndex ] = useState< number | undefined >( undefined );

	const linkedLabel = isLinked
		? __( 'Unlink sides', 'flexible-table-block' )
		: __( 'Link sides', 'flexible-table-block' );

	const allInputValue: string | 0 = isMixed ? '' : values.top;

	const toggleLinked = () => setIsLinked( ! isLinked );

	const handleOnChangeAll = ( inputValue: string | undefined ) => {
		onChange( {
			top: inputValue,
			right: inputValue,
			bottom: inputValue,
			left: inputValue,
		} );
	};

	const handleOnChange = ( inputValue: string | undefined, targetSide: SideValue ) => {
		onChange( {
			...values,
			[ targetSide ]: inputValue,
		} );
	};

	const handleOnPickerOpen = ( targetPickerIndex: number | undefined ) => {
		setIsPickerOpen( true );
		setPickerIndex( targetPickerIndex );
	};

	const handleOnPickerClose = () => {
		setIsPickerOpen( false );
		setPickerIndex( undefined );
	};

	return (
		<BaseControl className={ clsx( 'ftb-border-color-control', className ) } help={ help }>
			<Stack direction="column" gap="sm" role="group" aria-labelledby={ instanceId }>
				<BaseControl.VisualLabel id={ instanceId }>{ label }</BaseControl.VisualLabel>
				<Stack align="flex-start" justify="space-between" gap="sm">
					{ isLinked ? (
						<Stack align="center" gap="md">
							<SideIndicatorControl />
							<ColorIndicatorButton
								label={ __( 'All', 'flexible-table-block' ) }
								value={ allInputValue }
								onClick={ () => handleOnPickerOpen( undefined ) }
								isNone={ ! allInputValue && ! isMixed }
								isTransparent={ allInputValue === 'transparent' }
								isMixed={ isMixed }
							/>
							{ isPickerOpen && ! pickerIndex && (
								<Popover placement="left-start" shift offset={ 36 } onClose={ handleOnPickerClose }>
									<div style={ { padding: '16px' } }>
										<ColorPalette
											colors={ colors }
											value={ allInputValue || '' }
											onChange={ handleOnChangeAll }
										/>
									</div>
								</Popover>
							) }
						</Stack>
					) : (
						<Stack direction="column" gap="sm">
							{ SIDE_CONTROLS.map( ( item, index ) => (
								<Stack align="center" gap="md" key={ item.value }>
									<SideIndicatorControl side={ item.value } />
									<ColorIndicatorButton
										label={ item.label }
										value={ values[ item.value ] }
										onClick={ () => handleOnPickerOpen( index ) }
										isNone={ ! values[ item.value ] }
										isTransparent={ values[ item.value ] === 'transparent' }
									/>
									{ isPickerOpen && pickerIndex === index && (
										<Popover
											placement="left-start"
											shift
											offset={ 36 }
											onClose={ handleOnPickerClose }
										>
											<div style={ { padding: '16px' } }>
												<ColorPalette
													colors={ colors }
													value={ values[ item.value ] || '' }
													onChange={ ( value ) => handleOnChange( value, item.value ) }
												/>
											</div>
										</Popover>
									) }
								</Stack>
							) ) }
						</Stack>
					) }
					<Button
						label={ linkedLabel }
						onClick={ toggleLinked }
						icon={ isLinked ? link : linkOff }
						size="small"
					/>
				</Stack>
			</Stack>
		</BaseControl>
	);
}
