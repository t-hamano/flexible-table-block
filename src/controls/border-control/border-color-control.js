/**
 * External dependencies
 */
import { get } from 'lodash';

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
	__experimentalText as Text,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { SIDES, SideIndicatorControl } from '../indicator-control';

export default function BorderColorControl( { id, onChange, values } ) {
	const isMixed = ! (
		values.top === values.right &&
		values.top === values.bottom &&
		values.top === values.left
	);

	const colors = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return get( getSettings(), [ 'colors' ], [] );
	} );

	const [ isLinked, setIsLinked ] = useState( true );
	const [ isPickerOpen, setIsPickerOpen ] = useState( false );
	const [ pickerIndex, setPickerIndex ] = useState( undefined );

	const headingId = `${ id }-heading`;

	const linkedLabel = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputValue = isMixed ? undefined : values.top;

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( {
			top: null,
			right: null,
			bottom: null,
			left: null,
		} );
	};

	const handleOnChangeAll = ( inputValue ) => {
		onChange( {
			top: inputValue,
			right: inputValue,
			bottom: inputValue,
			left: inputValue,
		} );
	};

	const handleOnChange = ( inputValue, targetSide ) => {
		onChange( {
			...values,
			[ targetSide ]: inputValue,
		} );
	};

	return (
		<BaseControl className="ftb-border-color-control" id={ id } aria-labelledby={ headingId }>
			<div className="ftb-border-color-control__header">
				<Text id={ headingId }>{ __( 'Border Color', 'flexible-table-block' ) }</Text>
				<Button isSecondary isSmall onClick={ handleOnReset } value={ ! isMixed || values.top }>
					{ __( 'Reset' ) }
				</Button>
			</div>
			<div className="ftb-border-color-control__controls">
				<div className="ftb-border-color-control__controls-inner">
					{ isLinked && (
						<div className="ftb-border-color-control__controls-row">
							<SideIndicatorControl />
							<Button
								className="ftb-border-color-control__indicator"
								onClick={ () => {
									setIsPickerOpen( true );
									setPickerIndex( undefined );
								} }
								aria-label={ __( 'All', 'flexible-table-block' ) }
							>
								{ isMixed ? (
									__( 'Mixed', 'flexible-table-block' )
								) : (
									<ColorIndicator colorValue={ allInputValue } />
								) }
							</Button>
							{ isPickerOpen && ! pickerIndex && (
								<Popover
									className="ftb-border-color-control__popover"
									position="top right"
									onClose={ () => {
										setIsPickerOpen( false );
										setPickerIndex( undefined );
									} }
								>
									<ColorPalette
										colors={ colors }
										value={ allInputValue }
										onChange={ handleOnChangeAll }
									/>
								</Popover>
							) }
						</div>
					) }
					{ ! isLinked &&
						SIDES.map( ( item, index ) => {
							return (
								<div className="ftb-border-color-control__controls-row" key={ item }>
									<SideIndicatorControl sides={ [ item.value ] } />
									<Button
										className="ftb-border-color-control__indicator"
										onClick={ () => {
											setIsPickerOpen( true );
											setPickerIndex( index );
										} }
										aria-label={ item.label }
									>
										<ColorIndicator colorValue={ values[ item.value ] } />
									</Button>
									{ isPickerOpen && pickerIndex === index && (
										<Popover
											className="ftb-border-color-control__popover"
											position="top right"
											onClose={ () => {
												setIsPickerOpen( false );
												setPickerIndex( undefined );
											} }
										>
											<ColorPalette
												colors={ colors }
												value={ values[ item.value ] }
												onChange={ ( value ) => {
													handleOnChange( value, item.value );
												} }
											/>
										</Popover>
									) }
								</div>
							);
						} ) }
				</div>
				<Tooltip text={ linkedLabel }>
					<span>
						<Button
							variant={ isLinked ? 'primary' : 'secondary' }
							isSmall
							onClick={ toggleLinked }
							icon={ isLinked ? link : linkOff }
							iconSize="16"
						/>
					</span>
				</Tooltip>
			</div>
		</BaseControl>
	);
}
