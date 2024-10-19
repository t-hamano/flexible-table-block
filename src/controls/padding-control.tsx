/**
 * External dependencies
 */
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
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';

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
	label: string;
	help?: string;
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
	label = __( 'Padding', 'flexible-table-block' ),
	help,
	onChange,
	values: valuesProp,
	allowSides = true,
	hasIndicator = true,
}: Props ) {
	const values = { ...DEFAULT_VALUES, ...valuesProp };
	const instanceId = useInstanceId( PaddingControl, 'ftb-padding-control' );
	const headingId = `${ instanceId }-heading`;

	const isMixed: boolean =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const paddingUnits = useCustomUnits( { availableUnits: PADDING_UNITS } );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const [ side, setSide ] = useState< SideValue | undefined >( undefined );

	const linkedLabel: string = isLinked
		? __( 'Unlink sides', 'flexible-table-block' )
		: __( 'Link sides', 'flexible-table-block' );

	const allInputPlaceholder: string = isMixed ? __( 'Mixed', 'flexible-table-block' ) : '';
	const allInputValue: string | 0 = isMixed ? '' : values.top;

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

	const handleOnChangeAll = ( inputValue: string | undefined ) => {
		const sanitizedValue = sanitizeUnitValue( inputValue );
		onChange( {
			top: sanitizedValue,
			right: sanitizedValue,
			bottom: sanitizedValue,
			left: sanitizedValue,
		} );
	};

	const handleOnChange = ( inputValue: string | undefined, targetSide: SideValue ) => {
		onChange( {
			...values,
			[ targetSide ]: sanitizeUnitValue( inputValue ),
		} );
	};

	return (
		<BaseControl className="ftb-padding-control" help={ help } __nextHasNoMarginBottom>
			<VStack aria-labelledby={ headingId } role="region">
				<HStack>
					<Text id={ headingId } upperCase size="11" weight="500">
						{ label }
					</Text>
					<Button variant="secondary" onClick={ handleOnReset } size="small">
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</HStack>
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
							size="__unstable-large"
						/>
					) }
					{ allowSides && (
						<Button
							className="ftb-padding-control__header-linked-button"
							label={ linkedLabel }
							onClick={ toggleLinked }
							icon={ isLinked ? link : linkOff }
							size="small"
						/>
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
								onChange={ ( value ) => handleOnChange( value, item.value ) }
								size="__unstable-large"
							/>
						) ) }
					</div>
				) }
			</VStack>
		</BaseControl>
	);
}
