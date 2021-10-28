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
	// @ts-ignore
	__experimentalText as Text,
	// @ts-ignore
	__experimentalUnitControl as UnitControl,
	// @ts-ignore
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { BORDER_SPACING_UNITS, MAX_BORDER_SPACING } from '../constants';
import { DIRECTIONS, DirectionIndicatorControl } from './indicator-control';
import { parseUnit, sanitizeUnitValue } from '../utils/helper';
import type { Directions } from './indicator-control';

const DEFAULT_VALUES = {
	horizontal: undefined,
	vertical: undefined,
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

	const isMixed = allowSides && ! ( values.horizontal === values.vertical );

	const borderSpacingUnits = useCustomUnits( { availableUnits: BORDER_SPACING_UNITS } );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const [ direction, setDirection ] = useState< Directions | undefined >( undefined );

	const headingId = `${ id }-heading`;

	const linkedLabel = isLinked
		? __( 'Unlink Directions', 'flexible-table-block' )
		: __( 'Link Directions', 'flexible-table-block' );

	const allInputPlaceholder = isMixed ? __( 'Mixed', 'flexible-table-block' ) : undefined;
	const allInputValue = isMixed ? undefined : values.horizontal;

	const classNames = classnames( 'ftb-border-spacing-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setDirection( undefined );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( {
			horizontal: undefined,
			vertical: undefined,
		} );
	};

	const handleOnFocus = ( focusDirection: Directions ) => setDirection( focusDirection );

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

	const handleOnChange = ( inputValue: string, targetDirection: Directions ) => {
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
						{ DIRECTIONS.map( ( item ) => (
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
