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
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { Fieldset, IconButton, Stack } from '@wordpress/ui';

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
	className?: string;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;

export default function PaddingControl( {
	label = __( 'Padding', 'flexible-table-block' ),
	help,
	onChange,
	values: valuesProp,
	className,
}: Props ) {
	const values = { ...DEFAULT_VALUES, ...valuesProp };

	const isMixed = ! (
		values.top === values.right &&
		values.top === values.bottom &&
		values.top === values.left
	);

	const paddingUnits = useCustomUnits( { availableUnits: PADDING_UNITS } );

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
		<Fieldset.Root className={ clsx( 'ftb-padding-control', className ) }>
			<Fieldset.Legend>{ label }</Fieldset.Legend>
			<Stack align="center" justify="space-between" gap="sm" style={ { minHeight: '40px' } }>
				<Stack align="center" gap="sm">
					<SideIndicatorControl side={ side } />
					{ isLinked && (
						<div>
							<UnitControl
								placeholder={ allInputPlaceholder }
								aria-label={ __( 'All', 'flexible-table-block' ) }
								onChange={ handleOnChangeAll }
								value={ allInputValue }
								units={ paddingUnits }
								__unstableInputWidth="100px"
							/>
						</div>
					) }
				</Stack>
				<IconButton
					label={ linkedLabel }
					onClick={ toggleLinked }
					icon={ isLinked ? link : linkOff }
					variant="minimal"
					tone="neutral"
					size="small"
				/>
			</Stack>
			{ ! isLinked && (
				<div className="ftb-side-controls">
					{ SIDE_CONTROLS.map( ( item ) => (
						<div key={ item.value } className={ `ftb-side-controls__item is-${ item.value }` }>
							<UnitControl
								aria-label={ item.label }
								value={ values[ item.value as ValuesKey ] }
								units={ paddingUnits }
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
