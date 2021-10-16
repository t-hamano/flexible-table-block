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
import { BORDER_RADIUS_UNITS, MAX_BORDER_RADIUS } from '../constants';
import { parseUnit } from '../utils/helper';
import { CORNERS, CornerIndicatorControl } from './indicator-control';

const DEFAULT_VALUES = {
	topLeft: null,
	topRight: null,
	bottomRight: null,
	bottomLeft: null,
};

export default function BorderRadiusControl( {
	id,
	label = __( 'Border Radius', 'flexible-table-block' ),
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
			values.topLeft === values.topRight &&
			values.topLeft === values.bottomRight &&
			values.topLeft === values.bottomLeft
		);

	const borderRadiusUnits = useCustomUnits( {
		availableUnits: BORDER_RADIUS_UNITS,
	} );

	const [ isLinked, setIsLinked ] = useState( true );
	const [ corner, setCorner ] = useState( undefined );

	const headingId = `${ id }-heading`;

	const linkedLabel = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputPlaceholder = isMixed
		? __( 'Mixed', 'flexible-table-block' )
		: undefined;
	const allInputValue = isMixed ? undefined : values.topLeft;

	const classNames = classnames( 'ftb-border-radius-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setCorner( undefined );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( {
			topLeft: null,
			topRight: null,
			bottomRight: null,
			bottomLeft: null,
		} );
	};

	const handleOnFocus = ( focusCorner ) => {
		setCorner( focusCorner );
	};

	const handleOnChangeAll = ( inputValue ) => {
		const [ value, unit ] = parseUnit( inputValue );
		const parsedValue = `${ Math.min(
			MAX_BORDER_RADIUS[ unit ],
			value
		) }${ unit }`;

		onChange( {
			topLeft: parsedValue,
			topRight: parsedValue,
			bottomRight: parsedValue,
			bottomLeft: parsedValue,
		} );
	};

	const handleOnChange = ( inputValue, targetCorner ) => {
		const [ value, unit ] = parseUnit( inputValue );
		const parsedValue = `${ Math.min(
			MAX_BORDER_RADIUS[ unit ],
			value
		) }${ unit }`;

		onChange( {
			...values,
			[ targetCorner ]: parsedValue,
		} );
	};

	return (
		<BaseControl
			className={ classNames }
			id={ id }
			help={ help }
			aria-labelledby={ headingId }
		>
			<div className="ftb-border-radius-control__header">
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
			<div className="ftb-border-radius-control__header-control">
				{ hasIndicator && (
					<CornerIndicatorControl
						corners={
							corner === undefined ? undefined : [ corner ]
						}
					/>
				) }
				{ isLinked && (
					<UnitControl
						aria-label={ __( 'All', 'flexible-table-block' ) }
						placeholder={ allInputPlaceholder }
						onChange={ handleOnChangeAll }
						value={ allInputValue }
						units={ borderRadiusUnits }
						min="0"
					/>
				) }
				<Tooltip text={ linkedLabel }>
					<span>
						<Button
							isSmall
							isPrimary={ isLinked }
							isSecondary={ ! isLinked }
							variant={ isLinked ? 'primary' : 'secondary' }
							onClick={ toggleLinked }
							icon={ isLinked ? link : linkOff }
							iconSize="16"
						/>
					</span>
				</Tooltip>
			</div>
			{ ! isLinked && (
				<div className="ftb-border-radius-control__input-controls">
					{ CORNERS.map( ( item ) => (
						<UnitControl
							key={ item.value }
							aria-label={ item.label }
							value={ values[ item.value ] }
							units={ borderRadiusUnits }
							min="0"
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
