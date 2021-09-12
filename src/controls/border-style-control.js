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
import { SideControlHeader, SideControlWrapper, SideControlRow } from './styles';
import { SideControlIcon } from './icons';
import { borderSolid, borderDotted, borderDashed, borderDouble } from '../icon';

const DEFAULT_VALUES = {
	top: null,
	right: null,
	bottom: null,
	left: null,
};

const LABELS = {
	all: __( 'All', 'flexible-table-block' ),
	top: __( 'Top', 'flexible-table-block' ),
	bottom: __( 'Bottom', 'flexible-table-block' ),
	left: __( 'Left', 'flexible-table-block' ),
	right: __( 'Right', 'flexible-table-block' ),
	mixed: __( 'Mixed', 'flexible-table-block' ),
};

const STYLES = [
	{
		label: __( 'Solid', 'flexible-table-block' ),
		value: 'solid',
		icon: borderSolid,
	},
	{
		label: __( 'Dotted', 'flexible-table-block' ),
		value: 'dotted',
		icon: borderDotted,
	},
	{
		label: __( 'Dashed', 'flexible-table-block' ),
		value: 'dashed',
		icon: borderDashed,
	},
	{
		label: __( 'Double', 'flexible-table-block' ),
		value: 'double',
		icon: borderDouble,
	},
];

export default function BorderStyleControl( { id, values, allowReset = true, onChange } ) {
	const [ isLinked, setIsLinked ] = useState( false );
	const headingId = `${ id }-heading`;
	const inputValues = values || DEFAULT_VALUES;

	const linkedLabel = isLinked
		? __( 'Unlink Sides', 'flexible-table-block' )
		: __( 'Link Sides', 'flexible-table-block' );

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
	};

	const handleOnReset = () => {};

	const handleOnClickAll = ( value ) => {
		const nextValues = {
			top: value,
			right: value,
			bottom: value,
			left: value,
		};
		onChange( nextValues === inputValues ? DEFAULT_VALUES : nextValues );
	};

	const handleOnClick = ( value, side ) => {
		if ( inputValues[ side ] && value === inputValues[ side ] ) {
			onChange( {
				...inputValues,
				[ side ]: value,
			} );
		} else {
			onChange( {
				...inputValues,
				[ side ]: null,
			} );
		}
	};

	return (
		<BaseControl id={ id } aria-labelledby={ headingId }>
			<SideControlHeader>
				<Text id={ headingId }>{ __( 'Border Style', 'flexible-table-block' ) }</Text>
				{ allowReset && (
					<Button isSecondary isSmall onClick={ handleOnReset }>
						{ __( 'Reset' ) }
					</Button>
				) }
			</SideControlHeader>
			<SideControlWrapper>
				{ isLinked ? (
					<>
						<SideControlIcon />
						<ButtonGroup className="ftb-components__border-style-group">
							{ STYLES.map( ( borderStyle ) => {
								return (
									<Button
										isSmall
										key={ borderStyle }
										icon={ borderStyle.icon }
										aria-label={ borderStyle.label }
										onClick={ () => handleOnClickAll( borderStyle.value ) }
									/>
								);
							} ) }
						</ButtonGroup>
					</>
				) : (
					<div>
						{ [ 'top', 'right', 'bottom', 'left' ].map( ( side ) => {
							return (
								<SideControlRow key={ side }>
									<SideControlIcon sides={ [ side ] } />
									<ButtonGroup
										className="ftb-components__border-style-group"
										aria-label={ LABELS[ side ] }
									>
										{ STYLES.map( ( borderStyle ) => {
											return (
												<Button
													isSmall
													key={ borderStyle }
													icon={ borderStyle.icon }
													aria-label={ borderStyle.label }
													onClick={ () => handleOnClick( borderStyle.value, side ) }
												/>
											);
										} ) }
									</ButtonGroup>
								</SideControlRow>
							);
						} ) }
					</div>
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
			</SideControlWrapper>
		</BaseControl>
	);
}
