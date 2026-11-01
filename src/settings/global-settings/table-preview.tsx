/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { createBlock } from '@wordpress/blocks';
import {
	BlockEditorProvider,
	// @ts-expect-error Not exported in the type definitions.
	BlockPreview,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Stack, Text } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import { REST_API_PREVIEW_ROUTE } from '../../constants';
import example from '../../example';
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

const isBlockStyle = ( style: EditorStyle ) => !! style.flexibleTableBlock;

export default function TablePreview( { blockStyle }: Props ) {
	const [ blockCss, setBlockCss ] = useState< string | undefined >( undefined );

	const editorSettings = useSelect( ( select ) => select( blockEditorStore ).getSettings(), [] );

	const previewBlocks = useMemo(
		() => [
			createBlock( 'flexible-table-block/table', example.attributes ),
			createBlock( 'flexible-table-block/table', {
				...example.attributes,
				className: 'is-style-stripes',
			} ),
		],
		[]
	);

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
			<div className="ftb-global-setting-modal__preview-content">
				<BlockEditorProvider value={ EMPTY_BLOCKS } settings={ previewSettings }>
					<BlockPreview blocks={ previewBlocks } viewportWidth={ 600 } />
				</BlockEditorProvider>
			</div>
		</Stack>
	);
}
