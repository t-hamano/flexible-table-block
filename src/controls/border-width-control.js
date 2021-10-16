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
import { BORDER_WIDTH_UNITS, MAX_BORDER_WIDTH } from '../constants';
import { parseUnit } from '../utils/helper';
import { SIDES, SideIndicatorControl } from './indicator-control';

const DEFAULT_VALUES = {
	top: null,
	right: null,
	bottom: null,
	left: null,
};

export default function BorderWidthControl( {
	id,
	label = __( 'Border Width', 'flexible-table-block' ),
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
		! (
			values.top === values.right &&
			values.top === values.bottom &&
			values.top === values.left
		);

	const borderWidthUnits = useCustomUnits( {
		availableUnits: BORDER_WIDTH_UNITS,
	} );

	const [ isLinked, setIsLinked ] = useState( true );
	const [ side, setSide ] = useState( undefined );

	const headingId = `${ id }-heading`;

	const linkedLabel = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputPlaceholder = isMixed
		? __( 'Mixed', 'flexible-table-block' )
		: undefined;
	const allInputValue = isMixed ? undefined : values.top;

	const classNames = classnames( 'ftb-border-width-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setSide( undefined );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( {
			top: null,
			right: null,
			bottom: null,
			left: null,
		} );
	};

	const handleOnFocus = ( focusSide ) => {
		setSide( focusSide );
	};

	const handleOnChangeAll = ( inputValue ) => {
		const [ value, unit ] = parseUnit( inputValue );
		const parsedValue = `${ Math.min(
			MAX_BORDER_WIDTH[ unit ],
			value
		) }${ unit }`;

		onChange( {
			top: parsedValue,
			right: parsedValue,
			bottom: parsedValue,
			left: parsedValue,
		} );
	};

	const handleOnChange = ( inputValue, targetSide ) => {
		const [ value, unit ] = parseUnit( inputValue );
		const parsedValue = `${ Math.min(
			MAX_BORDER_WIDTH[ unit ],
			value
		) }${ unit }`;

		onChange( {
			...values,
			[ targetSide ]: parsedValue,
		} );
	};

	return (
		<BaseControl
			className={ classNames }
			id={ id }
			help={ help }
			aria-labelledby={ headingId }
		>
			<div className="ftb-border-width-control__header">
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
			<div className="ftb-border-width-control__header-control">
				{ hasIndicator && (
					<SideIndicatorControl
						sides={ side === undefined ? undefined : [ side ] }
					/>
				) }
				{ ( isLinked || ! allowSides ) && (
					<UnitControl
						aria-label={ __( 'All', 'flexible-table-block' ) }
						value={ allInputValue }
						units={ borderWidthUnits }
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
				<div className="ftb-border-width-control__input-controls">
					{ SIDES.map( ( item ) => (
						<UnitControl
							key={ item.value }
							aria-label={ item.label }
							value={ values[ item.value ] }
							units={ borderWidthUnits }
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
