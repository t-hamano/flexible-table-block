/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { toTableAttributes, type VTable } from '../utils/table-state';
import type { BlockAttributes } from '../BlockAttributes';

/**
 * Returns a function that applies a structural change to the table (e.g. creating
 * the table, inserting, deleting, merging or splitting cells) as its own undo level.
 *
 * Every table update writes the same `head`, `body` and `foot` attributes, so the
 * block editor merges consecutive updates, including cell text edits, into a single
 * undo level. Marking the change before and after keeps a structural change from
 * being merged with the edits around it.
 *
 * @param setAttributes The block's setAttributes function.
 */
export function useStructuralTableChange(
	setAttributes: ( attrs: Partial< BlockAttributes > ) => void
) {
	const {
		// @ts-expect-error Not exported in the type definitions.
		__unstableMarkLastChangeAsPersistent: markLastChangeAsPersistent,
	} = useDispatch( blockEditorStore );

	return ( newVTable: VTable ) => {
		markLastChangeAsPersistent();
		setAttributes( toTableAttributes( newVTable ) );
		markLastChangeAsPersistent();
	};
}
