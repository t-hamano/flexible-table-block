/**
 * External dependencies
 */
import classnames from 'classnames';
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
import { BORDER_RADIUS_UNITS, MAX_BORDER_RADIUS, CORNER_CONTROLS } from '../constants';
import { CornerIndicatorControl } from './indicator-control';
import { parseUnit, sanitizeUnitValue } from '../utils/helper';
import type { CornerValue } from '../BlockAttributes';

const DEFAULT_VALUES = {
	topLeft: '',
	topRight: '',
	bottomRight: '',
	bottomLeft: '',
};

type Props = {
	id: string;
	label: string;
	help?: string;
	className?: string;
	onChange: ( event: any ) => void;
	values: {
		topLeft?: Property.BorderTopLeftRadius;
		topRight?: Property.BorderTopRightRadius;
		bottomRight?: Property.BorderBottomRightRadius;
		bottomLeft?: Property.BorderBottomLeftRadius;
	};
	allowSides?: boolean;
	hasIndicator?: boolean;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;
type MaxBorderRadiusKey = keyof typeof MAX_BORDER_RADIUS;

export default function BorderRadiusControl( {
	id,
	label = __( 'Border Radius', 'flexible-table-block' ),
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

	const isMixed: boolean =
		allowSides &&
		! (
			values.topLeft === values.topRight &&
			values.topLeft === values.bottomRight &&
			values.topLeft === values.bottomLeft
		);

	const borderRadiusUnits = useCustomUnits( { availableUnits: BORDER_RADIUS_UNITS } );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const [ corner, setCorner ] = useState< CornerValue | undefined >( undefined );

	const headingId: string = `${ id }-heading`;

	const linkedLabel: string = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputPlaceholder: string = isMixed ? __( 'Mixed', 'flexible-table-block' ) : '';
	const allInputValue: string | 0 = isMixed ? '' : values.topLeft;

	const classNames: string = classnames( 'ftb-border-radius-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setCorner( undefined );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		setCorner( undefined );
		onChange( DEFAULT_VALUES );
	};

	const handleOnFocus = ( focusCorner: CornerValue ) => setCorner( focusCorner );

	const handleOnChangeAll = ( inputValue: string ) => {
		const [ , unit ] = parseUnit( inputValue );
		const sanitizedValue = sanitizeUnitValue( inputValue, {
			maxNum: MAX_BORDER_RADIUS[ unit as MaxBorderRadiusKey ],
		} );

		onChange( {
			topLeft: sanitizedValue,
			topRight: sanitizedValue,
			bottomRight: sanitizedValue,
			bottomLeft: sanitizedValue,
		} );
	};

	const handleOnChange = ( inputValue: string, targetCorner: CornerValue ) => {
		const [ , unit ] = parseUnit( inputValue );
		const sanitizedValue = sanitizeUnitValue( inputValue, {
			maxNum: MAX_BORDER_RADIUS[ unit as MaxBorderRadiusKey ],
		} );

		onChange( {
			...values,
			[ targetCorner ]: sanitizedValue,
		} );
	};

	return (
		<BaseControl id={ id } className={ classNames } help={ help }>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-border-radius-control__header">
					<Text id={ headingId }>{ label }</Text>
					<Button isSmall isSecondary onClick={ handleOnReset }>
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-border-radius-control__header-control">
					{ hasIndicator && (
						<CornerIndicatorControl corners={ corner === undefined ? undefined : [ corner ] } />
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
								label={ linkedLabel }
								isSmall
								isPrimary={ isLinked }
								isSecondary={ ! isLinked }
								onClick={ toggleLinked }
								icon={ isLinked ? link : linkOff }
								iconSize="16"
							/>
						</span>
					</Tooltip>
				</div>
				{ ! isLinked && (
					<div className="ftb-border-radius-control__input-controls">
						{ CORNER_CONTROLS.map( ( item ) => (
							<UnitControl
								key={ item.value }
								aria-label={ item.label }
								value={ values[ item.value as ValuesKey ] }
								units={ borderRadiusUnits }
								min="0"
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
