/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Returns a function that shows a warning snackbar notice.
 *
 * Using the same `id` replaces an existing notice instead of stacking a new one.
 */
export function useWarningNotice() {
	const { createWarningNotice } = useDispatch( noticesStore );

	return ( message: string, id: string ) => {
		createWarningNotice( message, { id, type: 'snackbar' } );
	};
}
