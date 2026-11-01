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
import { useState } from '@wordpress/element';
import { Fieldset, IconButton, Stack } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import ColorIndicatorButton from './color-indicator-button';
import ColorPalettePopover from './color-palette-popover';
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

	const isMixed = ! (
		values.top === values.right &&
		values.top === values.bottom &&
		values.top === values.left
	);

	const [ isLinked, setIsLinked ] = useState( true );
	const [ isPickerOpen, setIsPickerOpen ] = useState( false );
	const [ pickerIndex, setPickerIndex ] = useState< number | undefined >( undefined );

	const linkedLabel = isLinked
		? __( 'Unlink sides', 'flexible-table-block' )
		: __( 'Link sides', 'flexible-table-block' );

	const allInputValue: string = isMixed ? '' : values.top;

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setIsPickerOpen( false );
		setPickerIndex( undefined );
	};

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
		<Fieldset.Root className={ clsx( 'ftb-border-color-control', className ) }>
			<Fieldset.Legend>{ label }</Fieldset.Legend>
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
							isExpanded={ isPickerOpen && pickerIndex === undefined }
						/>
						{ isPickerOpen && pickerIndex === undefined && (
							<ColorPalettePopover
								value={ allInputValue }
								onChange={ handleOnChangeAll }
								onClose={ handleOnPickerClose }
							/>
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
									isExpanded={ isPickerOpen && pickerIndex === index }
								/>
								{ isPickerOpen && pickerIndex === index && (
									<ColorPalettePopover
										value={ values[ item.value ] }
										onChange={ ( value ) => handleOnChange( value, item.value ) }
										onClose={ handleOnPickerClose }
									/>
								) }
							</Stack>
						) ) }
					</Stack>
				) }
				<IconButton
					label={ linkedLabel }
					onClick={ toggleLinked }
					icon={ isLinked ? link : linkOff }
					variant="minimal"
					tone="neutral"
					size="small"
				/>
			</Stack>
			{ help && <Fieldset.Description>{ help }</Fieldset.Description> }
		</Fieldset.Root>
	);
}
