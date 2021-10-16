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
	__experimentalText as Text,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { BORDER_SPACING_UNITS, MAX_BORDER_SPACING } from '../constants';
import { parseUnit } from '../utils/helper';
import { DIRECTIONS, DirectionIndicatorControl } from './indicator-control';

const DEFAULT_VALUES = {
	horizontal: null,
	vertical: null,
};

export default function BorderSpacingControl( {
	id,
	label = __( 'Border Spacing', 'flexible-table-block' ),
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

	const isMixed = allowSides && ! ( values.horizontal === values.vertical );

	const borderSpacingUnits = useCustomUnits( {
		availableUnits: BORDER_SPACING_UNITS,
	} );

	const [ isLinked, setIsLinked ] = useState( true );
	const [ direction, setDirection ] = useState( undefined );

	const headingId = `${ id }-heading`;

	const linkedLabel = isLinked
		? __( 'Unlink Directions', 'flexible-table-block' )
		: __( 'Link Directions', 'flexible-table-block' );

	const allInputPlaceholder = isMixed
		? __( 'Mixed', 'flexible-table-block' )
		: undefined;
	const allInputValue = isMixed ? undefined : values.horizontal;

	const classNames = classnames( 'ftb-border-spacing-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setDirection( undefined );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( {
			horizontal: null,
			vertical: null,
		} );
	};

	const handleOnFocus = ( focusDirection ) => {
		setDirection( focusDirection );
	};

	const handleOnChangeAll = ( inputValue ) => {
		const [ value, unit ] = parseUnit( inputValue );
		const parsedValue = `${ Math.min(
			MAX_BORDER_SPACING[ unit ],
			value
		) }${ unit }`;

		onChange( {
			horizontal: parsedValue,
			vertical: parsedValue,
		} );
	};

	const handleOnChange = ( inputValue, targetDirection ) => {
		const [ value, unit ] = parseUnit( inputValue );
		const parsedValue = `${ Math.min(
			MAX_BORDER_SPACING[ unit ],
			value
		) }${ unit }`;

		onChange( {
			...values,
			[ targetDirection ]: parsedValue,
		} );
	};

	return (
		<BaseControl
			className={ classNames }
			id={ id }
			help={ help }
			aria-labelledby={ headingId }
		>
			<div className="ftb-border-spacing-control__header">
				<Text id={ headingId }>{ label }</Text>
				<Button
					isSmall
					isSecondary
					variant="secondary"
					onClick={ handleOnReset }
				>
					{ __( 'Reset' ) }
				</Button>
			</div>
			<div className="ftb-border-spacing-control__header-control">
				{ hasIndicator && (
					<DirectionIndicatorControl
						directions={
							direction === undefined ? undefined : [ direction ]
						}
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
								variant={ isLinked ? 'primary' : 'secondary' }
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
							value={ values[ item.value ] }
							units={ borderSpacingUnits }
							onFocus={ () => handleOnFocus( item.value ) }
							onChange={ ( value ) =>
								handleOnChange( value, item.value )
							}
						/>
					) ) }
				</div>
			) }
		</BaseControl>
	);
}
