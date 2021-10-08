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
	ButtonGroup,
	Button,
	Tooltip,
	__experimentalText as Text,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { BORDER_STYLE_CONTROLS } from '../constants';
import { SIDES, SideIndicatorControl } from './indicator-control';

const DEFAULT_VALUES = {
	top: null,
	right: null,
	bottom: null,
	left: null,
};

export default function BorderStyleControl( {
	id,
	label = __( 'Border Style', 'flexible-table-block' ),
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
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const [ isLinked, setIsLinked ] = useState( true );
	const headingId = `${ id }-heading`;

	const controlLabel =
		isMixed && isLinked ? `${ label } ${ __( '(Mixed)', 'flexible-table-block' ) }` : label;

	const linkedLabel = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputValue = isMixed ? undefined : values.top;

	const classNames = classnames( 'ftb-border-width-control', className );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
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

	const handleOnClickAll = ( value ) => {
		const newValue =
			value === values.top &&
			value === values.right &&
			value === values.bottom &&
			value === values.left
				? null
				: value;
		onChange( {
			top: newValue,
			right: newValue,
			bottom: newValue,
			left: newValue,
		} );
	};

	const handleOnClick = ( value, targetSide ) => {
		const newValue = values[ targetSide ] && value === values[ targetSide ] ? null : value;
		onChange( {
			...values,
			[ targetSide ]: newValue,
		} );
	};

	return (
		<BaseControl className={ classNames } id={ id } help={ help } aria-labelledby={ headingId }>
			<div className="ftb-border-style-control__header">
				<Text id={ headingId }>{ controlLabel }</Text>
				<Button isSecondary isSmall onClick={ handleOnReset } value={ ! isMixed || values.top }>
					{ __( 'Reset' ) }
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
										isSmall
										isPrimary={ allInputValue === borderStyle.value }
										variant={ allInputValue === borderStyle.value ? 'primary' : undefined }
										onClick={ () => handleOnClickAll( borderStyle.value ) }
									/>
								) ) }
							</ButtonGroup>
						</div>
					) }
					{ ! isLinked &&
						SIDES.map( ( item ) => (
							<div className="ftb-border-style-control__button-controls-row" key={ item.value }>
								{ hasIndicator && <SideIndicatorControl sides={ [ item.value ] } /> }
								<ButtonGroup className="ftb-button-group" aria-label={ item.label }>
									{ BORDER_STYLE_CONTROLS.map( ( borderStyle ) => {
										return (
											<Button
												key={ borderStyle.value }
												label={ borderStyle.label }
												icon={ borderStyle.icon }
												isPrimary={ values[ item.value ] === borderStyle.value }
												variant={
													values[ item.value ] === borderStyle.value ? 'primary' : undefined
												}
												isSmall
												onClick={ () => handleOnClick( borderStyle.value, item.value ) }
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
				) }
			</div>
		</BaseControl>
	);
}
