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
import { BaseControl, Button, ColorPalette } from '@wordpress/components';
import { Stack, Text, Popover, VisuallyHidden, getWpCompatOverlaySlot } from '@wordpress/ui';
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
	const headingId = `${ instanceId }-heading`;

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

	return (
		<BaseControl className={ clsx( 'ftb-border-color-control', className ) } help={ help }>
			<Stack direction="column" gap="sm" aria-labelledby={ headingId } role="group">
				<Text variant="heading-sm" id={ headingId }>
					{ label }
				</Text>
				<Stack align="start" justify="space-between" gap="sm">
					{ isLinked ? (
						<Stack align="center" justify="start" gap="md">
							<SideIndicatorControl />
							<Popover.Root>
								<Popover.Trigger
									render={
										<ColorIndicatorButton
											label={ __( 'All', 'flexible-table-block' ) }
											value={ allInputValue }
											isNone={ ! allInputValue && ! isMixed }
											isTransparent={ allInputValue === 'transparent' }
											isMixed={ isMixed }
										/>
									}
								/>
								<Popover.Popup
									portal={ <Popover.Portal container={ getWpCompatOverlaySlot() } /> }
									positioner={ <Popover.Positioner side="left" align="start" sideOffset={ 36 } /> }
								>
									<VisuallyHidden render={ <Popover.Title /> }>
										{ __( 'All', 'flexible-table-block' ) }
									</VisuallyHidden>
									<ColorPalette
										colors={ colors }
										value={ allInputValue || '' }
										onChange={ handleOnChangeAll }
									/>
								</Popover.Popup>
							</Popover.Root>
						</Stack>
					) : (
						<Stack direction="column" gap="sm">
							{ SIDE_CONTROLS.map( ( item ) => (
								<Stack align="center" justify="start" gap="md" key={ item.value }>
									<SideIndicatorControl side={ item.value } />
									<Popover.Root>
										<Popover.Trigger
											render={
												<ColorIndicatorButton
													label={ item.label }
													value={ values[ item.value ] }
													isNone={ ! values[ item.value ] }
													isTransparent={ values[ item.value ] === 'transparent' }
												/>
											}
										/>
										<Popover.Popup
											portal={ <Popover.Portal container={ getWpCompatOverlaySlot() } /> }
											positioner={
												<Popover.Positioner side="left" align="start" sideOffset={ 36 } />
											}
										>
											<VisuallyHidden render={ <Popover.Title /> }>{ item.label }</VisuallyHidden>
											<ColorPalette
												colors={ colors }
												value={ values[ item.value ] || '' }
												onChange={ ( value ) => handleOnChange( value, item.value ) }
											/>
										</Popover.Popup>
									</Popover.Root>
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
