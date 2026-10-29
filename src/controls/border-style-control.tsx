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
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import { Fieldset, Stack } from '@wordpress/ui';

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
		onChange( {
			top: value,
			right: value,
			bottom: value,
			left: value,
		} );
	};

	const handleOnClick = ( value: string | number | undefined, targetSide: ValuesKey ) => {
		onChange( {
			...values,
			[ targetSide ]: value,
		} );
	};

	return (
		<Fieldset.Root className={ clsx( 'ftb-border-style-control', className ) }>
			<Fieldset.Legend>
				{ isMixed && isLinked ? `${ label } ${ __( '(Mixed)', 'flexible-table-block' ) }` : label }
			</Fieldset.Legend>
			<Stack align="flex-start" justify="space-between" gap="sm">
				{ isLinked ? (
					<Stack align="center" gap="sm">
						{ hasIndicator && <SideIndicatorControl /> }
						<ToggleGroupControl
							hideLabelFromVision
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
			{ help && <Fieldset.Description>{ help }</Fieldset.Description> }
		</Fieldset.Root>
	);
}
