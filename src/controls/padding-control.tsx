/**
 * External dependencies
 */
import classnames from 'classnames';
import type { Property } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import {
	BaseControl,
	Button,
	Tooltip,
	// @ts-ignore: has no exported member
	__experimentalText as Text,
	// @ts-ignore: has no exported member
	__experimentalUnitControl as UnitControl,
	// @ts-ignore: has no exported member
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { PADDING_UNITS, SIDE_CONTROLS } from '../constants';
import { sanitizeUnitValue } from '../utils/helper';
import { SideIndicatorControl } from './indicator-control';
import type { SideValue } from '../BlockAttributes';

const DEFAULT_VALUES = {
	top: '',
	right: '',
	bottom: '',
	left: '',
};

type Props = {
	id: string;
	label: string;
	help?: string;
	className?: string;
	onChange: ( event: any ) => void;
	values: {
		top?: Property.PaddingTop;
		right?: Property.PaddingRight;
		bottom?: Property.PaddingBottom;
		left?: Property.PaddingLeft;
	};
	allowSides?: boolean;
	hasIndicator?: boolean;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;

export default function PaddingControl( {
	id,
	label = __( 'Padding', 'flexible-table-block' ),
	help,
	className,
	onChange,
	values: valuesProp,
	allowSides = true,
	hasIndicator = true,
}: Props ) {
	const values = { ...DEFAULT_VALUES, ...valuesProp };

	const isMixed: boolean =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const paddingUnits = useCustomUnits( { availableUnits: PADDING_UNITS } );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const [ side, setSide ] = useState< SideValue | undefined >( undefined );

	const headingId: string = `${ id }-heading`;

	const linkedLabel: string = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputPlaceholder: string = isMixed ? __( 'Mixed', 'flexible-table-block' ) : '';
	const allInputValue: string | 0 = isMixed ? '' : values.top;

	const classNames: string = classnames( 'ftb-padding-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setSide( undefined );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		setSide( undefined );
		onChange( DEFAULT_VALUES );
	};

	const handleOnFocus = ( focusSide: SideValue ) => setSide( focusSide );

	const handleOnChangeAll = ( inputValue: string ) => {
		const sanitizedValue = sanitizeUnitValue( inputValue );
		onChange( {
			top: sanitizedValue,
			right: sanitizedValue,
			bottom: sanitizedValue,
			left: sanitizedValue,
		} );
	};

	const handleOnChange = ( inputValue: string, targetSide: SideValue ) => {
		onChange( {
			...values,
			[ targetSide ]: sanitizeUnitValue( inputValue ),
		} );
	};

	return (
		<BaseControl id={ id } className={ classNames } help={ help }>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-padding-control__header">
					<Text id={ headingId }>{ label }</Text>
					<Button isSmall isSecondary onClick={ handleOnReset }>
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-padding-control__header-control">
					{ hasIndicator && (
						<SideIndicatorControl sides={ side === undefined ? undefined : [ side ] } />
					) }
					{ ( isLinked || ! allowSides ) && (
						<UnitControl
							placeholder={ allInputPlaceholder }
							aria-label={ __( 'All', 'flexible-table-block' ) }
							onChange={ handleOnChangeAll }
							value={ allInputValue }
							units={ paddingUnits }
						/>
					) }
					{ allowSides && (
						<Tooltip text={ linkedLabel }>
							<span>
								<Button
									label={ linkedLabel }
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
				{ ! isLinked && allowSides && (
					<div className="ftb-padding-control__input-controls">
						{ SIDE_CONTROLS.map( ( item ) => (
							<UnitControl
								key={ item.value }
								aria-label={ item.label }
								value={ values[ item.value as ValuesKey ] }
								units={ paddingUnits }
								onFocus={ () => handleOnFocus( item.value ) }
								onChange={ ( value: string ) => handleOnChange( value, item.value ) }
							/>
						) ) }
					</div>
				) }
			</div>
		</BaseControl>
	);
}
