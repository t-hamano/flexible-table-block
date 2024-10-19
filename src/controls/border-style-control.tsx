/**
 * External dependencies
 */
import clsx from 'clsx';
import type { PropertyValue } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import {
	BaseControl,
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalText as Text,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { BORDER_STYLE_CONTROLS, SIDE_CONTROLS } from '../constants';
import { SideIndicatorControl } from './indicator-control';

const DEFAULT_VALUES = {
	top: '',
	right: '',
	bottom: '',
	left: '',
};

type Props = {
	id: string;
	label: string;
	help?: string;
	className?: string;
	onChange: ( event: any ) => void;
	values: {
		top?: PropertyValue< string >;
		right?: PropertyValue< string >;
		bottom?: PropertyValue< string >;
		left?: PropertyValue< string >;
	};
	allowSides?: boolean;
	hasIndicator?: boolean;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;

export default function BorderStyleControl( {
	id,
	label = __( 'Border style', 'flexible-table-block' ),
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
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const [ isLinked, setIsLinked ] = useState< boolean >( true );
	const headingId = `${ id }-heading`;

	const controlLabel: string =
		isMixed && isLinked ? `${ label } ${ __( '(Mixed)', 'flexible-table-block' ) }` : label;

	const linkedLabel: string = isLinked
		? __( 'Unlink sides', 'flexible-table-block' )
		: __( 'Link sides', 'flexible-table-block' );

	const allInputValue: string | 0 = isMixed ? '' : values.top;

	const classNames: string = clsx( 'ftb-border-style-control', className );

	const toggleLinked = () => setIsLinked( ! isLinked );

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( DEFAULT_VALUES );
	};

	const handleOnClickAll = ( value: string | number | undefined ) => {
		const newValue =
			value === values.top &&
			value === values.right &&
			value === values.bottom &&
			value === values.left
				? undefined
				: value;

		onChange( {
			top: newValue,
			right: newValue,
			bottom: newValue,
			left: newValue,
		} );
	};

	const handleOnClick = ( value: string | number | undefined, targetSide: ValuesKey ) => {
		const newValue =
			values[ targetSide as ValuesKey ] && value === values[ targetSide as ValuesKey ]
				? undefined
				: value;

		onChange( {
			...values,
			[ targetSide ]: newValue,
		} );
	};

	return (
		<BaseControl id={ id } className={ classNames } help={ help }>
			<div aria-labelledby={ headingId } role="region">
				<div className="ftb-border-style-control__header">
					<Text id={ headingId }>{ controlLabel }</Text>
					<Button variant="secondary" onClick={ handleOnReset } size="small">
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-border-style-control__button-controls">
					<div className="ftb-border-style-control__button-controls-inner">
						{ isLinked && (
							<div className="ftb-border-style-control__button-controls-row">
								{ hasIndicator && <SideIndicatorControl /> }
								<ToggleGroupControl
									hideLabelFromVision
									__nextHasNoMarginBottom
									label={ label }
									value={ allInputValue }
									isDeselectable
									onChange={ handleOnClickAll }
								>
									{ BORDER_STYLE_CONTROLS.map( ( borderStyle ) => (
										<ToggleGroupControlOptionIcon
											key={ borderStyle.value }
											label={ borderStyle.label }
											value={ borderStyle.value }
											icon={ borderStyle.icon }
										/>
									) ) }
								</ToggleGroupControl>
							</div>
						) }
						{ ! isLinked &&
							SIDE_CONTROLS.map( ( item ) => (
								<div className="ftb-border-style-control__button-controls-row" key={ item.value }>
									{ hasIndicator && <SideIndicatorControl sides={ [ item.value ] } /> }
									<ToggleGroupControl
										hideLabelFromVision
										__nextHasNoMarginBottom
										label={ item.label }
										value={ values[ item.value as ValuesKey ] }
										isDeselectable
										onChange={ ( value ) => handleOnClick( value, item.value as ValuesKey ) }
									>
										{ BORDER_STYLE_CONTROLS.map( ( borderStyle ) => (
											<ToggleGroupControlOptionIcon
												key={ borderStyle.value }
												label={ borderStyle.label }
												value={ borderStyle.value }
												icon={ borderStyle.icon }
											/>
										) ) }
									</ToggleGroupControl>
								</div>
							) ) }
					</div>
					{ allowSides && (
						<Button
							className="ftb-border-style-control__header-linked-button"
							label={ linkedLabel }
							onClick={ toggleLinked }
							icon={ isLinked ? link : linkOff }
							size="small"
						/>
					) }
				</div>
			</div>
		</BaseControl>
	);
}
