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
import { BORDER_STYLES, SIDES } from '../utils/constants';
import { SideControlIcon } from './icons';

export default function BorderStyleControl( { id, onChange, values } ) {
	const isMixed = ! (
		values.top === values.right &&
		values.top === values.bottom &&
		values.top === values.left
	);

	const [ isLinked, setIsLinked ] = useState( true );
	const headingId = `${ id }-heading`;

	const controlLabel =
		isMixed && isLinked
			? __( 'Border Style (Mixed)', 'flexible-table-block' )
			: __( 'Border Style', 'flexible-table-block' );

	const linkedLabel = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const allInputValue = isMixed ? undefined : values.top;

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
		onChange( {
			top: value,
			right: value,
			bottom: value,
			left: value,
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
		<BaseControl className="ftb-border-style-control" id={ id } aria-labelledby={ headingId }>
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
							<SideControlIcon />
							<ButtonGroup className="ftb-button-group">
								{ BORDER_STYLES.map( ( borderStyle ) => {
									return (
										<Button
											isSmall
											isPressed={ allInputValue === borderStyle.value }
											key={ borderStyle }
											icon={ borderStyle.icon }
											aria-label={ borderStyle.label }
											onClick={ () => handleOnClickAll( borderStyle.value ) }
										/>
									);
								} ) }
							</ButtonGroup>
						</div>
					) }
					{ ! isLinked &&
						SIDES.map( ( item ) => {
							return (
								<div className="ftb-border-style-control__button-controls-row" key={ item }>
									<SideControlIcon sides={ [ item.value ] } />
									<ButtonGroup className="ftb-button-group" aria-label={ item.label }>
										{ BORDER_STYLES.map( ( borderStyle ) => {
											return (
												<Button
													isSmall
													isPressed={ values[ item.value ] === borderStyle.value }
													key={ borderStyle }
													icon={ borderStyle.icon }
													aria-label={ borderStyle.label }
													onClick={ () => handleOnClick( borderStyle.value, item.value ) }
												/>
											);
										} ) }
									</ButtonGroup>
								</div>
							);
						} ) }
				</div>
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
		</BaseControl>
	);
}
