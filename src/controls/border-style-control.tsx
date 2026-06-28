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
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { Stack } from '@wordpress/ui';

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
	label: string;
	help?: string;
	onChange: ( event: any ) => void;
	values: {
		top?: PropertyValue< string >;
		right?: PropertyValue< string >;
		bottom?: PropertyValue< string >;
		left?: PropertyValue< string >;
	};
	allowSides?: boolean;
	hasIndicator?: boolean;
	className?: string;
};

type ValuesKey = keyof typeof DEFAULT_VALUES;

export default function BorderStyleControl( {
	label = __( 'Border style', 'flexible-table-block' ),
	help,
	onChange,
	values: valuesProp,
	allowSides = true,
	hasIndicator = true,
	className,
}: Props ) {
	const values = {
		...DEFAULT_VALUES,
		...valuesProp,
	};
	const instanceId = useInstanceId( BorderStyleControl, 'ftb-border-style-control' );

	const isMixed =
		allowSides &&
		! ( values.top === values.right && values.top === values.bottom && values.top === values.left );

	const [ isLinked, setIsLinked ] = useState( true );

	const linkedLabel = isLinked
		? __( 'Unlink sides', 'flexible-table-block' )
		: __( 'Link sides', 'flexible-table-block' );

	const allInputValue: string | undefined = isMixed ? undefined : values.top || undefined;

	const toggleLinked = () => setIsLinked( ! isLinked );

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
		<BaseControl className={ clsx( 'ftb-border-style-control', className ) } help={ help }>
			<Stack direction="column" gap="sm" role="group" aria-labelledby={ instanceId }>
				<BaseControl.VisualLabel id={ instanceId }>
					{ isMixed && isLinked
						? `${ label } ${ __( '(Mixed)', 'flexible-table-block' ) }`
						: label }
				</BaseControl.VisualLabel>
				<Stack align="flex-start" justify="space-between" gap="sm">
					{ isLinked ? (
						<Stack align="center" gap="sm">
							{ hasIndicator && <SideIndicatorControl /> }
							<ToggleGroupControl
								hideLabelFromVision
								__next40pxDefaultSize
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
						</Stack>
					) : (
						<Stack direction="column" gap="xs">
							{ SIDE_CONTROLS.map( ( item ) => (
								<Stack align="center" gap="sm" key={ item.value }>
									{ hasIndicator && <SideIndicatorControl side={ item.value } /> }
									<ToggleGroupControl
										hideLabelFromVision
										__next40pxDefaultSize
										label={ item.label }
										value={ values[ item.value as ValuesKey ] || undefined }
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
								</Stack>
							) ) }
						</Stack>
					) }
					{ allowSides && (
						<Button
							label={ linkedLabel }
							onClick={ toggleLinked }
							icon={ isLinked ? link : linkOff }
							size="small"
							style={ { marginTop: '6px' } }
						/>
					) }
				</Stack>
			</Stack>
		</BaseControl>
	);
}
