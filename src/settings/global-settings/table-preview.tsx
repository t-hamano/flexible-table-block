/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { getBlockFromExample, store as blocksStore } from '@wordpress/blocks';
import { Composite, __experimentalTruncate as Truncate } from '@wordpress/components';
import {
	BlockEditorProvider,
	// @ts-expect-error Not exported in the type definitions.
	BlockPreview,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, Stack, Text } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import { REST_API_PREVIEW_ROUTE } from '../../constants';
import metadata from '../../block.json';
import type { ApiResponse, StoreOptions } from '../../store';

type Props = {
	blockStyle: StoreOptions[ 'block_style' ];
};

interface EditorStyle {
	css: string;
	flexibleTableBlock?: boolean;
	[ key: string ]: unknown;
}

const PREVIEW_DEBOUNCE_DELAY = 300;
const EMPTY_BLOCKS: never[] = [];

interface BlockStyleVariation {
	name: string;
	label?: string;
	isDefault?: boolean;
}

const isBlockStyle = ( style: EditorStyle ) => !! style.flexibleTableBlock;

// Add the default style if missing, as the block sidebar does.
function getRenderedStyles( styles: BlockStyleVariation[] ): BlockStyleVariation[] {
	if ( styles.some( ( style ) => style.isDefault ) ) {
		return styles;
	}
	return [
		{
			name: 'default',
			label: _x( 'Default', 'block style', 'flexible-table-block' ),
			isDefault: true,
		},
		...styles,
	];
}

export default function TablePreview( { blockStyle }: Props ) {
	const [ blockCss, setBlockCss ] = useState< string | undefined >( undefined );

	const editorSettings = useSelect( ( select ) => select( blockEditorStore ).getSettings(), [] );

	const { blockStyles, blockExample } = useSelect( ( select ) => {
		const { getBlockStyles, getBlockType } = select( blocksStore );
		return {
			blockStyles: getBlockStyles( metadata.name ) as BlockStyleVariation[] | undefined,
			blockExample: getBlockType( metadata.name )?.example,
		};
	}, [] );

	const stylesToRender = useMemo( () => getRenderedStyles( blockStyles ?? [] ), [ blockStyles ] );

	const [ selectedStyleName, setSelectedStyleName ] = useState< string | undefined >( undefined );
	const activeStyle =
		stylesToRender.find( ( style ) => style.name === selectedStyleName ) ??
		stylesToRender.find( ( style ) => style.isDefault ) ??
		stylesToRender[ 0 ];

	// Build the preview block from the block example, as the block style preview in the block sidebar does.
	const previewBlocks = useMemo( () => {
		if ( ! blockExample || ! activeStyle ) {
			return EMPTY_BLOCKS;
		}
		const block = getBlockFromExample( metadata.name, {
			attributes: blockExample.attributes,
		} );
		return [
			{
				...block,
				attributes: {
					...block.attributes,
					className: `is-style-${ activeStyle.name }`,
				},
			},
		];
	}, [ blockExample, activeStyle ] );

	// Generate the block CSS from the unsaved options on the server.
	useEffect( () => {
		const controller = new AbortController();
		const timeoutId = setTimeout( () => {
			apiFetch< ApiResponse >( {
				path: REST_API_PREVIEW_ROUTE,
				method: 'POST',
				data: { block_style: blockStyle },
				signal: controller.signal,
			} )
				.then( ( response ) => {
					if ( typeof response.block_css === 'string' ) {
						setBlockCss( response.block_css );
					}
				} )
				.catch( () => {
					// Keep the previous preview if the request fails or is aborted.
				} );
		}, PREVIEW_DEBOUNCE_DELAY );

		return () => {
			clearTimeout( timeoutId );
			controller.abort();
		};
	}, [ blockStyle ] );

	// Replace the saved block CSS with the unsaved one, so that values removed
	// in the modal are also removed from the preview.
	const previewSettings = useMemo( () => {
		const styles = ( editorSettings?.styles ?? [] ) as EditorStyle[];

		if ( blockCss === undefined ) {
			return editorSettings;
		}

		const previewStyle: EditorStyle = {
			css: blockCss,
			__unstableType: 'plugin',
			flexibleTableBlock: true,
		};

		return {
			...editorSettings,
			styles: styles.some( isBlockStyle )
				? styles.map( ( style ) => ( isBlockStyle( style ) ? previewStyle : style ) )
				: [ previewStyle, ...styles ],
		} as typeof editorSettings;
	}, [ editorSettings, blockCss ] );

	return (
		<Stack direction="column" gap="lg" className="ftb-global-setting-modal__preview">
			<Text variant="heading-md" render={ <h5 /> }>
				{ __( 'Preview', 'flexible-table-block' ) }
			</Text>
			<Composite
				role="radiogroup"
				aria-label={ __( 'Block styles', 'flexible-table-block' ) }
				className="ftb-global-setting-modal__preview-styles"
				focusLoop
			>
				{ stylesToRender.map( ( style ) => {
					const isActive = style.name === activeStyle?.name;
					return (
						<Composite.Item
							key={ style.name }
							render={
								<Button
									className="ftb-global-setting-modal__preview-style"
									tone="neutral"
									variant={ isActive ? 'solid' : 'outline' }
								/>
							}
							role="radio"
							aria-checked={ isActive }
							onClick={ () => setSelectedStyleName( style.name ) }
						>
							<Truncate numberOfLines={ 3 }>{ style.label || style.name }</Truncate>
						</Composite.Item>
					);
				} ) }
			</Composite>
			<div className="ftb-global-setting-modal__preview-content">
				<BlockEditorProvider value={ EMPTY_BLOCKS } settings={ previewSettings }>
					<BlockPreview blocks={ previewBlocks } viewportWidth={ 600 } />
				</BlockEditorProvider>
			</div>
		</Stack>
	);
}
