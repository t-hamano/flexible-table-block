/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import {
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { Fieldset, IconButton, Stack } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import { parseUnit, sanitizeUnitValue } from '../utils/helper';
import {
	CornerIndicatorControl,
	DirectionIndicatorControl,
	SideIndicatorControl,
} from './indicator-control';
import type { CornerValue, DirectionValue, SideValue } from '../BlockAttributes';

type Props< K extends string > = {
	label: string;
	help?: string;
	className?: string;
	onChange: ( values: Record< K, string > ) => void;
	values: Partial< Record< K, string | number > >;
	items: readonly { label: string; value: K }[];
	layout: 'sides' | 'corners' | 'directions';
	availableUnits: string[];
	maxValues?: Record< string, number >;
	allowUnlink?: boolean;
};

export default function LinkedUnitControl< K extends string >( {
	label,
	help,
	className,
	onChange,
	values: valuesProp,
	items,
	layout,
	availableUnits,
	maxValues,
	allowUnlink = true,
}: Props< K > ) {
	const values = Object.fromEntries(
		items.map( ( { value } ) => [ value, valuesProp[ value ] ?? '' ] )
	) as Record< K, string | number >;

	const units = useCustomUnits( { availableUnits } );

	const [ isLinked, setIsLinked ] = useState( true );
	const [ focusedItem, setFocusedItem ] = useState< K | undefined >( undefined );

	const isMixed = allowUnlink && new Set( Object.values( values ) ).size > 1;
	const showAllInput = isLinked || ! allowUnlink;

	let linkedLabel;
	if ( layout === 'directions' ) {
		linkedLabel = isLinked
			? __( 'Unlink directions', 'flexible-table-block' )
			: __( 'Link directions', 'flexible-table-block' );
	} else {
		linkedLabel = isLinked
			? __( 'Unlink sides', 'flexible-table-block' )
			: __( 'Link sides', 'flexible-table-block' );
	}

	const sanitize = ( inputValue: string | undefined ) => {
		const [ , unit ] = parseUnit( inputValue ?? '' );
		return sanitizeUnitValue( inputValue, { maxNum: maxValues?.[ unit ] } );
	};

	const renderIndicator = ( item?: K ) => {
		if ( layout === 'corners' ) {
			return <CornerIndicatorControl corner={ item as CornerValue | undefined } />;
		}
		if ( layout === 'directions' ) {
			return <DirectionIndicatorControl direction={ item as DirectionValue | undefined } />;
		}
		return <SideIndicatorControl side={ item as SideValue | undefined } />;
	};

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
		setFocusedItem( undefined );
	};

	const handleOnChangeAll = ( inputValue: string | undefined ) => {
		const sanitizedValue = sanitize( inputValue );
		onChange(
			Object.fromEntries( items.map( ( { value } ) => [ value, sanitizedValue ] ) ) as Record<
				K,
				string
			>
		);
	};

	const handleOnChange = ( inputValue: string | undefined, targetItem: K ) => {
		onChange( {
			...values,
			[ targetItem ]: sanitize( inputValue ),
		} as Record< K, string > );
	};

	const allInput = (
		<UnitControl
			aria-label={ __( 'All', 'flexible-table-block' ) }
			value={ isMixed ? '' : values[ items[ 0 ].value ] }
			units={ units }
			placeholder={ isMixed ? __( 'Mixed', 'flexible-table-block' ) : '' }
			min={ 0 }
			onChange={ handleOnChangeAll }
			__unstableInputWidth="100px"
		/>
	);

	const renderItemInput = ( item: Props< K >[ 'items' ][ number ] ) => (
		<UnitControl
			aria-label={ item.label }
			value={ values[ item.value ] }
			units={ units }
			min={ 0 }
			onFocus={ () => setFocusedItem( item.value ) }
			onChange={ ( value ) => handleOnChange( value, item.value ) }
			// Corner inputs fill the grid column.
			__unstableInputWidth={ layout === 'corners' ? undefined : '100px' }
		/>
	);

	const linkButton = allowUnlink && (
		<IconButton
			label={ linkedLabel }
			icon={ isLinked ? link : linkOff }
			onClick={ toggleLinked }
			variant="minimal"
			tone="neutral"
			size="small"
			style={ layout === 'directions' ? { marginTop: '8px' } : undefined }
		/>
	);

	if ( layout === 'directions' ) {
		return (
			<Fieldset.Root className={ className }>
				<Fieldset.Legend>{ label }</Fieldset.Legend>
				<Stack align="flex-start" justify="space-between" gap="sm">
					{ showAllInput ? (
						<Stack align="center" gap="sm">
							{ renderIndicator() }
							{ allInput }
						</Stack>
					) : (
						<Stack direction="column" gap="xs">
							{ items.map( ( item ) => (
								<Stack align="center" gap="sm" key={ item.value }>
									{ renderIndicator( item.value ) }
									{ renderItemInput( item ) }
								</Stack>
							) ) }
						</Stack>
					) }
					{ linkButton }
				</Stack>
				{ help && <Fieldset.Description>{ help }</Fieldset.Description> }
			</Fieldset.Root>
		);
	}

	const itemsClassName = layout === 'corners' ? 'ftb-corner-controls' : 'ftb-side-controls';

	return (
		<Fieldset.Root className={ className }>
			<Fieldset.Legend>{ label }</Fieldset.Legend>
			<Stack align="center" justify="space-between" gap="sm" style={ { minHeight: '40px' } }>
				<Stack align="center" gap="sm">
					{ renderIndicator( focusedItem ) }
					{ showAllInput && <div>{ allInput }</div> }
				</Stack>
				{ linkButton }
			</Stack>
			{ ! showAllInput && (
				<div className={ itemsClassName }>
					{ items.map( ( item ) => (
						<div key={ item.value } className={ `${ itemsClassName }__item is-${ item.value }` }>
							{ renderItemInput( item ) }
						</div>
					) ) }
				</div>
			) }
			{ help && <Fieldset.Description>{ help }</Fieldset.Description> }
		</Fieldset.Root>
	);
}
