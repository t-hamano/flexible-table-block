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
	Flex,
	FlexBlock,
	FlexItem,
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
import { BORDER_WIDTH_UNITS, MAX_BORDER_WIDTH, SIDE_CONTROLS } from '../constants';
import { parseUnit, sanitizeUnitValue } from '../utils/helper';
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
		top?: Property.BorderTopWidth;
		right?: Property.BorderRightWidth;
		bottom?: Property.BorderBottomWidth;
		left?: Property.BorderLeftWidth;
	};
	allowSides?: boolean;
	hasIndicator?: boolean;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;
type MaxBorderWidthKey = keyof typeof MAX_BORDER_WIDTH;

export default function BorderWidthControl( {
	label = __( 'Border width', 'flexible-table-block' ),
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
	const instanceId = useInstanceId( BorderWidthControl, 'ftb-border-width-control' );
	const headingId = `${ instanceId }-heading`;

	const isMixed =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const borderWidthUnits = useCustomUnits( { availableUnits: BORDER_WIDTH_UNITS } );

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
		if ( inputValue ) {
			const [ , unit ] = parseUnit( inputValue );
			const sanitizedValue = sanitizeUnitValue( inputValue, {
				maxNum: MAX_BORDER_WIDTH[ unit as MaxBorderWidthKey ],
			} );
			onChange( {
				top: sanitizedValue,
				right: sanitizedValue,
				bottom: sanitizedValue,
				left: sanitizedValue,
			} );
		} else {
			onChange( {
				top: undefined,
				right: undefined,
				bottom: undefined,
				left: undefined,
			} );
		}
	};

	const handleOnChange = ( inputValue: string | undefined, targetSide: SideValue ) => {
		if ( inputValue ) {
			const [ , unit ] = parseUnit( inputValue );
			const sanitizedValue = sanitizeUnitValue( inputValue, {
				maxNum: MAX_BORDER_WIDTH[ unit as MaxBorderWidthKey ],
			} );
			onChange( {
				...values,
				[ targetSide ]: sanitizedValue,
			} );
		} else {
			onChange( {
				...values,
				[ targetSide ]: undefined,
			} );
		}
	};

	return (
		<BaseControl className="ftb-border-width-control" help={ help } __nextHasNoMarginBottom>
			<VStack aria-labelledby={ headingId } role="region">
				<HStack>
					<Flex>
						<FlexBlock>
							<Text id={ headingId } upperCase size="11" weight="500">
								{ label }
							</Text>
						</FlexBlock>
						<FlexItem>
							<Button variant="secondary" onClick={ handleOnReset } size="small">
								{ __( 'Reset', 'flexible-table-block' ) }
							</Button>
						</FlexItem>
					</Flex>
				</HStack>
				<div className="ftb-border-width-control__header-control">
					{ hasIndicator && (
						<SideIndicatorControl sides={ side === undefined ? undefined : [ side ] } />
					) }
					{ ( isLinked || ! allowSides ) && (
						<UnitControl
							aria-label={ __( 'All', 'flexible-table-block' ) }
							value={ allInputValue }
							units={ borderWidthUnits }
							placeholder={ allInputPlaceholder }
							onChange={ handleOnChangeAll }
							size="__unstable-large"
						/>
					) }
					{ allowSides && (
						<Button
							className="ftb-border-width-control__header-linked-button"
							label={ linkedLabel }
							icon={ isLinked ? link : linkOff }
							onClick={ toggleLinked }
							size="small"
						/>
					) }
				</div>
				{ ! isLinked && allowSides && (
					<div className="ftb-border-width-control__input-controls">
						{ SIDE_CONTROLS.map( ( item ) => (
							<UnitControl
								key={ item.value }
								aria-label={ item.label }
								value={ values[ item.value as ValuesKey ] }
								units={ borderWidthUnits }
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
