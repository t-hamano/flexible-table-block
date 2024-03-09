/**
 * External dependencies
 */
import classnames from 'classnames';
import type { PropertyValue } from 'csstype';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import {
	BaseControl,
	ButtonGroup,
	Button,
	Tooltip,
	// @ts-ignore: has no exported member
	__experimentalText as Text,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { BORDER_STYLE_CONTROLS, SIDE_CONTROLS } from '../constants';
import { SideIndicatorControl } from './indicator-control';
import type { BorderStyleValue } from '../BlockAttributes';

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

	const classNames: string = classnames( 'ftb-border-style-control', className );

	const toggleLinked = () => setIsLinked( ! isLinked );

	const handleOnReset = () => {
		setIsLinked( true );
		onChange( DEFAULT_VALUES );
	};

	const handleOnClickAll = ( value: BorderStyleValue ) => {
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

	const handleOnClick = ( value: BorderStyleValue, targetSide: ValuesKey ) => {
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
					<Button
						variant="secondary"
						onClick={ handleOnReset }
						// @ts-ignore: `size` prop is not exist at @types
						size="small"
					>
						{ __( 'Reset', 'flexible-table-block' ) }
					</Button>
				</div>
				<div className="ftb-border-style-control__button-controls">
					<div className="ftb-border-style-control__button-controls-inner">
						{ isLinked && (
							<div className="ftb-border-style-control__button-controls-row">
								{ hasIndicator && <SideIndicatorControl /> }
								<ButtonGroup className="ftb-button-group">
									{ BORDER_STYLE_CONTROLS.map( ( borderStyle ) => (
										<Button
											key={ borderStyle.value }
											label={ borderStyle.label }
											icon={ borderStyle.icon }
											variant={ allInputValue === borderStyle.value ? 'primary' : undefined }
											onClick={ () => handleOnClickAll( borderStyle.value ) }
											// @ts-ignore: `size` prop is not exist at @types
											size="compact"
										/>
									) ) }
								</ButtonGroup>
							</div>
						) }
						{ ! isLinked &&
							SIDE_CONTROLS.map( ( item ) => (
								<div className="ftb-border-style-control__button-controls-row" key={ item.value }>
									{ hasIndicator && <SideIndicatorControl sides={ [ item.value ] } /> }
									<ButtonGroup className="ftb-button-group" aria-label={ item.label }>
										{ BORDER_STYLE_CONTROLS.map( ( borderStyle ) => {
											return (
												<Button
													key={ borderStyle.value }
													label={ borderStyle.label }
													icon={ borderStyle.icon }
													variant={
														values[ item.value as ValuesKey ] === borderStyle.value
															? 'primary'
															: undefined
													}
													onClick={ () =>
														handleOnClick( borderStyle.value, item.value as ValuesKey )
													}
													// @ts-ignore: `size` prop is not exist at @types
													size="compact"
												/>
											);
										} ) }
									</ButtonGroup>
								</div>
							) ) }
					</div>
					{ allowSides && (
						<Tooltip text={ linkedLabel }>
							<span>
								<Button
									className="ftb-border-style-control__header-linked-button"
									label={ linkedLabel }
									onClick={ toggleLinked }
									icon={ isLinked ? link : linkOff }
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
