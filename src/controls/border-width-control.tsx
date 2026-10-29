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
import {
	Button,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { Fieldset, Stack } from '@wordpress/ui';

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
	className?: string;
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
	className,
}: Props ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};

	const isMixed =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const borderWidthUnits = useCustomUnits( { availableUnits: BORDER_WIDTH_UNITS } );

	const [ isLinked, setIsLinked ] = useState( true );
	const [ side, setSide ] = useState< SideValue | undefined >( undefined );

	const linkedLabel = isLinked
		? __( 'Unlink sides', 'flexible-table-block' )
		: __( 'Link sides', 'flexible-table-block' );

	const allInputPlaceholder = isMixed ? __( 'Mixed', 'flexible-table-block' ) : '';
	const allInputValue: string | 0 = isMixed ? '' : values.top;

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setSide( undefined );
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
		<Fieldset.Root className={ clsx( 'ftb-border-width-control', className ) }>
			<Fieldset.Legend>{ label }</Fieldset.Legend>
			<Stack align="center" justify="space-between" gap="sm" style={ { minHeight: '40px' } }>
				<Stack align="center" gap="sm">
					{ hasIndicator && <SideIndicatorControl side={ side } /> }
					{ ( isLinked || ! allowSides ) && (
						<div>
							<UnitControl
								aria-label={ __( 'All', 'flexible-table-block' ) }
								value={ allInputValue }
								units={ borderWidthUnits }
								placeholder={ allInputPlaceholder }
								onChange={ handleOnChangeAll }
								__unstableInputWidth="100px"
							/>
						</div>
					) }
				</Stack>
				{ allowSides && (
					<Button
						label={ linkedLabel }
						icon={ isLinked ? link : linkOff }
						onClick={ toggleLinked }
						size="small"
					/>
				) }
			</Stack>
			{ ! isLinked && allowSides && (
				<div className="ftb-side-controls">
					{ SIDE_CONTROLS.map( ( item ) => (
						<div key={ item.value } className={ `ftb-side-controls__item is-${ item.value }` }>
							<UnitControl
								aria-label={ item.label }
								value={ values[ item.value as ValuesKey ] }
								units={ borderWidthUnits }
								onFocus={ () => handleOnFocus( item.value ) }
								onChange={ ( value ) => handleOnChange( value, item.value ) }
								__unstableInputWidth="100px"
							/>
						</div>
					) ) }
				</div>
			) }
			{ help && <Fieldset.Description>{ help }</Fieldset.Description> }
		</Fieldset.Root>
	);
}
