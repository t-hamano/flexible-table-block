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
import {
	BaseControl,
	Button,
	Popover,
	ColorIndicator,
	ColorPalette,
	__experimentalText as Text,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
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
	allowSides?: boolean;
	hasIndicator?: boolean;
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
	allowSides = true,
	hasIndicator = true,
}: Props ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};
	const instanceId = useInstanceId( BorderColorControl, 'ftb-border-color-control' );
	const headingId = `${ instanceId }-heading`;

	const isMixed: boolean =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const colors = useSelect( ( select ) => {
		const settings = select(
			blockEditorStore
			// @ts-ignore
		).getSettings();
		return settings?.colors ?? [];
	}, [] );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const [ isPickerOpen, setIsPickerOpen ] = useState< boolean >( false );
	const [ pickerIndex, setPickerIndex ] = useState< number | undefined >( undefined );

	const linkedLabel: string = isLinked
		? __( 'Unlink sides', 'flexible-table-block' )
		: __( 'Link sides', 'flexible-table-block' );

	const allInputValue: string | 0 = isMixed ? '' : values.top;

	const toggleLinked = () => setIsLinked( ! isLinked );

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( DEFAULT_VALUES );
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
		<BaseControl className="ftb-border-color-control" help={ help } __nextHasNoMarginBottom>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-border-color-control__header">
					<Text id={ headingId }>{ label }</Text>
					<Button variant="secondary" onClick={ handleOnReset } size="small">
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-border-color-control__controls">
					<div className="ftb-border-color-control__controls-inner">
						{ ( isLinked || ! allowSides ) && (
							<div className="ftb-border-color-control__controls-row">
								{ hasIndicator && <SideIndicatorControl /> }
								<Button
									label={ __( 'All', 'flexible-table-block' ) }
									className={ clsx( 'ftb-border-color-control__indicator', {
										'ftb-border-color-control__indicator--none': ! allInputValue && ! isMixed,
										'ftb-border-color-control__indicator--mixed': isMixed,
										'ftb-border-color-control__indicator--transparent':
											allInputValue === 'transparent',
									} ) }
									onClick={ () => handleOnPickerOpen( undefined ) }
								>
									{ isMixed ? (
										__( 'Mixed', 'flexible-table-block' )
									) : (
										<ColorIndicator colorValue={ allInputValue || '' } />
									) }
								</Button>
								{ isPickerOpen && ! pickerIndex && (
									<Popover
										className="ftb-border-color-control__popover"
										onClose={ handleOnPickerClose }
									>
										<ColorPalette
											colors={ colors }
											value={ allInputValue || '' }
											onChange={ handleOnChangeAll }
										/>
									</Popover>
								) }
							</div>
						) }
						{ ! isLinked &&
							allowSides &&
							SIDE_CONTROLS.map( ( item, index ) => (
								<div className="ftb-border-color-control__controls-row" key={ index }>
									{ hasIndicator && <SideIndicatorControl sides={ [ item.value ] } /> }
									<Button
										label={ item.label }
										className={ clsx( 'ftb-border-color-control__indicator', {
											'ftb-border-color-control__indicator--none': ! values[ item.value ],
											'ftb-border-color-control__indicator--transparent':
												values[ item.value ] === 'transparent',
										} ) }
										onClick={ () => handleOnPickerOpen( index ) }
									>
										<ColorIndicator colorValue={ values[ item.value ] || '' } />
									</Button>
									{ isPickerOpen && pickerIndex === index && (
										<Popover
											className="ftb-border-color-control__popover"
											onClose={ handleOnPickerClose }
										>
											<ColorPalette
												colors={ colors }
												value={ values[ item.value ] || '' }
												onChange={ ( value ) => handleOnChange( value, item.value ) }
											/>
										</Popover>
									) }
								</div>
							) ) }
					</div>
					{ allowSides && (
						<Button
							className="ftb-border-color-control__header-linked-button"
							label={ linkedLabel }
							onClick={ toggleLinked }
							icon={ isLinked ? link : linkOff }
							size="small"
						/>
					) }
				</div>
			</div>
		</BaseControl>
	);
}
