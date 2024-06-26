/**
 * External dependencies
 */
import clsx from 'clsx';

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
	label = __( 'Border spacing', 'flexible-table-block' ),
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

	const headingId: string = `${ id }-heading`;

	const linkedLabel: string = isLinked
		? __( 'Unlink directions', 'flexible-table-block' )
		: __( 'Link directions', 'flexible-table-block' );

	const allInputPlaceholder: string = isMixed ? __( 'Mixed', 'flexible-table-block' ) : '';
	const allInputValue: string | 0 = isMixed ? '' : values.horizontal;

	const classNames: string = clsx( 'ftb-border-spacing-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
	};

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( DEFAULT_VALUES );
	};

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
					<Button
						variant="secondary"
						onClick={ handleOnReset }
						// @ts-ignore: `size` prop is not exist at @types
						size="small"
					>
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-border-spacing-control__controls">
					<div className="ftb-border-spacing-control__controls-inner">
						{ ( isLinked || ! allowSides ) && (
							<div className="ftb-border-spacing-control__controls-row">
								{ hasIndicator && <DirectionIndicatorControl /> }
								<UnitControl
									aria-label={ __( 'All', 'flexible-table-block' ) }
									value={ allInputValue }
									units={ borderSpacingUnits }
									placeholder={ allInputPlaceholder }
									onChange={ handleOnChangeAll }
									size="__unstable-large"
								/>
							</div>
						) }
						{ ! isLinked &&
							allowSides &&
							DIRECTION_CONTROLS.map( ( item, index ) => (
								<div className="ftb-border-spacing-control__controls-row" key={ index }>
									{ hasIndicator && <DirectionIndicatorControl directions={ [ item.value ] } /> }
									<UnitControl
										key={ item.value }
										aria-label={ item.label }
										value={ values[ item.value as ValuesKey ] }
										units={ borderSpacingUnits }
										onChange={ ( value: string ) => handleOnChange( value, item.value ) }
										size="__unstable-large"
									/>
								</div>
							) ) }
					</div>
					{ allowSides && (
						<Tooltip text={ linkedLabel }>
							<span>
								<Button
									className="ftb-border-spacing-control__header-linked-button"
									label={ linkedLabel }
									icon={ isLinked ? link : linkOff }
									onClick={ toggleLinked }
									// @ts-ignore: `size` prop is not exist at @types
									size="small"
								/>
							</span>
						</Tooltip>
					) }
				</div>
			</div>
		</BaseControl>
	);
}
