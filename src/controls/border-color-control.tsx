/**
 * External dependencies
 */
import { get } from 'lodash';
import classnames from 'classnames';

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
	Tooltip,
	ColorIndicator,
	ColorPalette,
	// @ts-ignore
	__experimentalText as Text,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { SIDES, SideIndicatorControl } from './indicator-control';
import type { Sides } from './indicator-control';

const DEFAULT_VALUES = {
	top: undefined,
	right: undefined,
	bottom: undefined,
	left: undefined,
};

type ValuesKey = keyof typeof DEFAULT_VALUES;

export default function BorderColorControl( {
	id,
	label = __( 'Border Color', 'flexible-table-block' ),
	help,
	className,
	onChange,
	values: valuesProp,
	allowSides = true,
	hasIndicator = true,
}: {
	id: string;
	label: string;
	help: string;
	className: string;
	onChange: ( event: any ) => void;
	values: typeof DEFAULT_VALUES;
	allowSides: boolean;
	hasIndicator: boolean;
} ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};

	const isMixed =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const colors = useSelect( ( select ) => {
		// @ts-ignore
		const settings = select( blockEditorStore ).getSettings();
		return get( settings, [ 'colors' ], [] );
	} );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const [ isPickerOpen, setIsPickerOpen ] = useState< boolean >( false );
	const [ pickerIndex, setPickerIndex ] = useState< number | undefined >( undefined );

	const headingId = `${ id }-heading`;

	const linkedLabel = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputValue = isMixed ? undefined : values.top;

	const classNames = classnames( 'ftb-border-color-control', className );

	const toggleLinked = () => setIsLinked( ! isLinked );

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( {
			top: undefined,
			right: undefined,
			bottom: undefined,
			left: undefined,
		} );
	};

	const handleOnChangeAll = ( inputValue: string ) => {
		onChange( {
			top: inputValue,
			right: inputValue,
			bottom: inputValue,
			left: inputValue,
		} );
	};

	const handleOnChange = ( inputValue: string | undefined, targetSide: Sides ) => {
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
		<BaseControl id={ id } className={ classNames } help={ help }>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-border-color-control__header">
					<Text id={ headingId }>{ label }</Text>
					<Button isSmall isSecondary onClick={ handleOnReset }>
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
									className="ftb-border-color-control__indicator"
									onClick={ () => handleOnPickerOpen( undefined ) }
								>
									{ isMixed ? (
										__( 'Mixed', 'flexible-table-block' )
									) : (
										<ColorIndicator
											className={ classnames( {
												'component-color-indicator--none': ! allInputValue,
												'component-color-indicator--transparent': allInputValue === 'transparent',
											} ) }
											colorValue={ allInputValue || '' }
										/>
									) }
								</Button>
								{ isPickerOpen && ! pickerIndex && (
									<Popover
										className="ftb-border-color-control__popover"
										position="top right"
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
							SIDES.map( ( item, index ) => (
								<div className="ftb-border-color-control__controls-row" key={ index }>
									{ hasIndicator && <SideIndicatorControl sides={ [ item.value ] } /> }
									<Button
										label={ item.label }
										className="ftb-border-color-control__indicator"
										onClick={ () => handleOnPickerOpen( index ) }
									>
										<ColorIndicator
											className={ classnames( {
												'component-color-indicator--none': ! values[ item.value as ValuesKey ],
												'component-color-indicator--transparent':
													values[ item.value as ValuesKey ] === 'transparent',
											} ) }
											colorValue={ values[ item.value as ValuesKey ] || '' }
										/>
									</Button>
									{ isPickerOpen && pickerIndex === index && (
										<Popover
											className="ftb-border-color-control__popover"
											position="top right"
											onClose={ handleOnPickerClose }
										>
											<ColorPalette
												colors={ colors }
												value={ values[ item.value as ValuesKey ] || '' }
												onChange={ ( value ) => handleOnChange( value, item.value ) }
											/>
										</Popover>
									) }
								</div>
							) ) }
					</div>
					{ allowSides && (
						<Tooltip text={ linkedLabel }>
							<span>
								<Button
									isSmall
									isPrimary={ isLinked }
									isSecondary={ ! isLinked }
									onClick={ toggleLinked }
									icon={ isLinked ? link : linkOff }
									iconSize="16"
								/>
							</span>
						</Tooltip>
					) }
				</div>
			</div>
		</BaseControl>
	);
}
