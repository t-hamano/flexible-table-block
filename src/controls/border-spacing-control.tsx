/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import {
	BaseControl,
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { BORDER_SPACING_UNITS, MAX_BORDER_SPACING, DIRECTION_CONTROLS } from '../constants';
import { DirectionIndicatorControl } from './indicator-control';
import { parseUnit, sanitizeUnitValue } from '../utils/helper';
import type { DirectionValue } from '../BlockAttributes';

const DEFAULT_VALUES = {
	horizontal: '',
	vertical: '',
};

type Props = {
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	values: typeof DEFAULT_VALUES;
	hasIndicator?: boolean;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;
type MaxBorderSpacingKey = keyof typeof MAX_BORDER_SPACING;

export default function BorderSpacingControl( {
	label = __( 'Border spacing', 'flexible-table-block' ),
	help,
	onChange,
	values: valuesProp,
	hasIndicator = true,
}: Props ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};
	const instanceId = useInstanceId( BorderSpacingControl, 'ftb-border-spacing-control' );
	const headingId = `${ instanceId }-heading`;

	const isMixed: boolean = ! ( values.horizontal === values.vertical );

	const borderSpacingUnits = useCustomUnits( { availableUnits: BORDER_SPACING_UNITS } );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );

	const linkedLabel: string = isLinked
		? __( 'Unlink directions', 'flexible-table-block' )
		: __( 'Link directions', 'flexible-table-block' );

	const allInputPlaceholder: string = isMixed ? __( 'Mixed', 'flexible-table-block' ) : '';
	const allInputValue: string | 0 = isMixed ? '' : values.horizontal;

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( DEFAULT_VALUES );
	};

	const handleOnChangeAll = ( inputValue: string | undefined ) => {
		if ( inputValue ) {
			const [ , unit ] = parseUnit( inputValue );
			const sanitizedValue = sanitizeUnitValue( inputValue, {
				maxNum: MAX_BORDER_SPACING[ unit as MaxBorderSpacingKey ],
			} );

			onChange( {
				horizontal: sanitizedValue,
				vertical: sanitizedValue,
			} );
		} else {
			onChange( {
				horizontal: undefined,
				vertical: undefined,
			} );
		}
	};

	const handleOnChange = ( inputValue: string | undefined, targetDirection: DirectionValue ) => {
		if ( inputValue ) {
			const [ , unit ] = parseUnit( inputValue );
			const sanitizedValue = sanitizeUnitValue( inputValue, {
				maxNum: MAX_BORDER_SPACING[ unit as MaxBorderSpacingKey ],
			} );

			onChange( {
				...values,
				[ targetDirection ]: sanitizedValue,
			} );
		} else {
			onChange( {
				...values,
				[ targetDirection ]: undefined,
			} );
		}
	};

	return (
		<BaseControl className="ftb-border-spacing-control" help={ help } __nextHasNoMarginBottom>
			<VStack aria-labelledby={ headingId } role="region">
				<HStack>
					<Text id={ headingId } upperCase size="11" weight="500">
						{ label }
					</Text>
					<Button variant="secondary" onClick={ handleOnReset } size="small">
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</HStack>
				<HStack>
					{ isLinked ? (
						<HStack>
							{ hasIndicator && <DirectionIndicatorControl /> }
							<UnitControl
								aria-label={ __( 'All', 'flexible-table-block' ) }
								value={ allInputValue }
								units={ borderSpacingUnits }
								placeholder={ allInputPlaceholder }
								onChange={ handleOnChangeAll }
								size="__unstable-large"
							/>
						</HStack>
					) : (
						<VStack spacing={ 1 }>
							{ DIRECTION_CONTROLS.map( ( item, index ) => (
								<HStack key={ index }>
									{ hasIndicator && <DirectionIndicatorControl directions={ [ item.value ] } /> }
									<UnitControl
										key={ item.value }
										aria-label={ item.label }
										value={ values[ item.value as ValuesKey ] }
										units={ borderSpacingUnits }
										onChange={ ( value ) => handleOnChange( value, item.value ) }
										size="__unstable-large"
									/>
								</HStack>
							) ) }
						</VStack>
					) }
					<Button
						label={ linkedLabel }
						icon={ isLinked ? link : linkOff }
						onClick={ toggleLinked }
						size="small"
					/>
				</HStack>
			</VStack>
		</BaseControl>
	);
}
