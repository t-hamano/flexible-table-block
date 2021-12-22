/**
 * External dependencies
 */
import classnames from 'classnames';

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
import { BORDER_SPACING_UNITS, MAX_BORDER_SPACING, DIRECTION_CONTROLS } from '../constants';
import { DirectionIndicatorControl } from './indicator-control';
import { parseUnit, sanitizeUnitValue } from '../utils/helper';
import type { DirectionValue } from '../BlockAttributes';

const DEFAULT_VALUES = {
	horizontal: '',
	vertical: '',
};

type Props = {
	id: string;
	label: string;
	help?: string;
	className?: string;
	onChange: ( event: any ) => void;
	values: typeof DEFAULT_VALUES;
	allowSides?: boolean;
	hasIndicator?: boolean;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;
type MaxBorderSpacingKey = keyof typeof MAX_BORDER_SPACING;

export default function BorderSpacingControl( {
	id,
	label = __( 'Border Spacing', 'flexible-table-block' ),
	help,
	className,
	onChange,
	values: valuesProp,
	allowSides = true,
	hasIndicator = true,
}: Props ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};

	const isMixed: boolean = allowSides && ! ( values.horizontal === values.vertical );

	const borderSpacingUnits = useCustomUnits( { availableUnits: BORDER_SPACING_UNITS } );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const [ direction, setDirection ] = useState< DirectionValue | undefined >( undefined );

	const headingId: string = `${ id }-heading`;

	const linkedLabel: string = isLinked
		? __( 'Unlink Directions', 'flexible-table-block' )
		: __( 'Link Directions', 'flexible-table-block' );

	const allInputPlaceholder: string = isMixed ? __( 'Mixed', 'flexible-table-block' ) : '';
	const allInputValue: string | 0 = isMixed ? '' : values.horizontal;

	const classNames: string = classnames( 'ftb-border-spacing-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setDirection( undefined );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		setDirection( undefined );
		onChange( DEFAULT_VALUES );
	};

	const handleOnFocus = ( focusDirection: DirectionValue ) => setDirection( focusDirection );

	const handleOnChangeAll = ( inputValue: string ) => {
		const [ , unit ] = parseUnit( inputValue );
		const sanitizedValue = sanitizeUnitValue( inputValue, {
			maxNum: MAX_BORDER_SPACING[ unit as MaxBorderSpacingKey ],
		} );

		onChange( {
			horizontal: sanitizedValue,
			vertical: sanitizedValue,
		} );
	};

	const handleOnChange = ( inputValue: string, targetDirection: DirectionValue ) => {
		const [ , unit ] = parseUnit( inputValue );
		const sanitizedValue = sanitizeUnitValue( inputValue, {
			maxNum: MAX_BORDER_SPACING[ unit as MaxBorderSpacingKey ],
		} );

		onChange( {
			...values,
			[ targetDirection ]: sanitizedValue,
		} );
	};

	return (
		<BaseControl id={ id } className={ classNames } help={ help }>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-border-spacing-control__header">
					<Text id={ headingId }>{ label }</Text>
					<Button isSmall isSecondary onClick={ handleOnReset }>
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-border-spacing-control__header-control">
					{ hasIndicator && (
						<DirectionIndicatorControl
							directions={ direction === undefined ? undefined : [ direction ] }
						/>
					) }
					{ ( isLinked || ! allowSides ) && (
						<UnitControl
							aria-label={ __( 'All', 'flexible-table-block' ) }
							value={ allInputValue }
							units={ borderSpacingUnits }
							placeholder={ allInputPlaceholder }
							onChange={ handleOnChangeAll }
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
									icon={ isLinked ? link : linkOff }
									iconSize="16"
									onClick={ toggleLinked }
								/>
							</span>
						</Tooltip>
					) }
				</div>
				{ ! isLinked && allowSides && (
					<div className="ftb-border-spacing-control__input-controls">
						{ DIRECTION_CONTROLS.map( ( item ) => (
							<UnitControl
								key={ item.value }
								aria-label={ item.label }
								value={ values[ item.value as ValuesKey ] }
								units={ borderSpacingUnits }
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
