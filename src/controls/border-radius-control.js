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
import { CORNERS, BORDER_RADIUS_UNITS } from '../utils/constants';
import { CornerControlIcon } from './icons';

export default function BorderRadiusControl( { id, onChange, values } ) {
	const isMixed = ! (
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

	const allInputPlaceholder = isMixed ? __( 'Mixed', 'flexible-table-block' ) : undefined;
	const allInputValue = isMixed ? undefined : values.topLeft;

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

	const handleOnFocus = ( value ) => () => {
		setCorner( value );
	};

	const handleOnChangeAll = ( value ) => {
		onChange( {
			topLeft: value,
			topRight: value,
			bottomRight: value,
			bottomLeft: value,
		} );
	};

	const handleOnChange = ( value, targetCorner ) => {
		onChange( {
			...values,
			[ targetCorner ]: value,
		} );
	};

	return (
		<BaseControl className="ftb-border-radius-control" id={ id } aria-labelledby={ headingId }>
			<div className="ftb-border-radius-control__header">
				<Text id={ headingId }>{ __( 'Border Radius', 'flexible-table-block' ) }</Text>
				<Button isSecondary isSmall onClick={ handleOnReset }>
					{ __( 'Reset' ) }
				</Button>
			</div>
			<div className="ftb-border-radius-control__header-control">
				<CornerControlIcon corners={ corner === undefined ? undefined : [ corner ] } />
				{ isLinked && (
					<UnitControl
						placeholder={ allInputPlaceholder }
						aria-label={ __( 'All', 'flexible-table-block' ) }
						onFocus={ handleOnFocus }
						onChange={ handleOnChangeAll }
						value={ allInputValue }
						units={ borderRadiusUnits }
					/>
				) }
				<Tooltip text={ linkedLabel }>
					<span>
						<Button
							variant={ isLinked ? 'primary' : 'secondary' }
							isSmall
							onClick={ toggleLinked }
							icon={ isLinked ? link : linkOff }
							iconSize="16"
						/>
					</span>
				</Tooltip>
			</div>
			{ ! isLinked && (
				<div className="ftb-border-radius-control__input-controls">
					{ CORNERS.map( ( item ) => {
						return (
							<UnitControl
								key={ item.value }
								aria-label={ item.label }
								onFocus={ handleOnFocus( item.value ) }
								onChange={ ( value ) => {
									handleOnChange( value, item.value );
								} }
								value={ values[ item.value ] }
								units={ borderRadiusUnits }
							/>
						);
					} ) }
				</div>
			) }
		</BaseControl>
	);
}
