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
	__experimentalText as Text,
} from '@wordpress/components';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { SIDES, SideIndicatorControl } from './indicator-control';

const DEFAULT_VALUES = {
	top: null,
	right: null,
	bottom: null,
	left: null,
};

export default function BorderColorControl( {
	id,
	label = __( 'Border Color', 'flexible-table-block' ),
	help,
	className,
	onChange,
	values: valuesProp,
	allowSides = true,
	hasIndicator = true,
} ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};

	const isMixed =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

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

	const classNames = classnames( 'ftb-border-color-control', className );

	const toggleLinked = () => setIsLinked( ! isLinked );

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

	const handleOnPickerOpen = ( targetPickerIndex ) => {
		setIsPickerOpen( true );
		setPickerIndex( targetPickerIndex );
	};

	const handleOnPickerClose = () => {
		setIsPickerOpen( false );
		setPickerIndex();
	};

	return (
		<BaseControl className={ classNames } help={ help }>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-border-color-control__header">
					<Text id={ headingId }>{ label }</Text>
					<Button isSmall isSecondary variant="secondary" onClick={ handleOnReset }>
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
									onClick={ () => handleOnPickerOpen() }
								>
									{ isMixed ? (
										__( 'Mixed', 'flexible-table-block' )
									) : (
										<ColorIndicator
											className={ classnames( {
												'component-color-indicator--none': ! allInputValue,
												'component-color-indicator--transparent': allInputValue === 'transparent',
											} ) }
											colorValue={ allInputValue }
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
											value={ allInputValue }
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
												'component-color-indicator--none': ! values[ item.value ],
												'component-color-indicator--transparent':
													values[ item.value ] === 'transparent',
											} ) }
											colorValue={ values[ item.value ] }
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
												value={ values[ item.value ] }
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
									variant={ isLinked ? 'primary' : 'secondary' }
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
