/**
 * External dependencies
 */
import type { KeyboardEvent, MouseEvent } from 'react';

/**
 * WordPress dependencies
 */
import { IconButton, Popover, VisuallyHidden } from '@wordpress/ui';
import { useEffect, useRef } from '@wordpress/element';
import { focus } from '@wordpress/dom';
import { trash } from '@wordpress/icons';

type Props = {
	label: string;
	anchor: HTMLElement | null;
	side: 'top' | 'left';
	onClick: ( event: MouseEvent ) => void;
};

function focusElement( element: HTMLElement ) {
	// Focus the window first, because Firefox does not move window focus
	// when focusing an element in another document.
	element.ownerDocument.defaultView?.focus();
	element.focus();
}

// Find the next tabbable element after the given element, skipping the focus guards inserted by the popover.
function findNextTabbable( element: HTMLElement ) {
	let next = focus.tabbable.findNext( element );
	while ( next?.hasAttribute( 'data-base-ui-focus-guard' ) ) {
		next = focus.tabbable.findNext( next );
	}
	return next as HTMLElement | undefined;
}

// Render the remover in a popover so that it is not cut off by the edge of the editor canvas,
// e.g. when the table is full width.
export default function TableRemovePopover( { label, anchor, side, onClick }: Props ) {
	const buttonRef = useRef< HTMLButtonElement >( null );

	// The popover is rendered outside the editor canvas, so it is not reachable in the tab order.
	// Move focus from the anchor to the remover with the Tab key.
	useEffect( () => {
		if ( ! anchor ) {
			return;
		}
		const onKeyDown = ( event: globalThis.KeyboardEvent ) => {
			if ( event.key !== 'Tab' || event.shiftKey || ! buttonRef.current ) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			focusElement( buttonRef.current );
		};
		anchor.addEventListener( 'keydown', onKeyDown );
		return () => anchor.removeEventListener( 'keydown', onKeyDown );
	}, [ anchor ] );

	if ( ! anchor ) {
		return null;
	}

	return (
		<Popover.Root open>
			<Popover.Popup
				className="ftb-remove-popover"
				// Don't move focus when the popover opens, because selecting a row or column
				// doesn't always mean that the user wants to delete it.
				initialFocus={ false }
				finalFocus={ false }
				positioner={
					<Popover.Positioner
						anchor={ anchor }
						side={ side }
						sideOffset={ 8 }
						// Keep the remover inside the editor canvas iframe, e.g. not behind the admin menu.
						collisionBoundary={ anchor.ownerDocument.defaultView?.frameElement ?? undefined }
					/>
				}
			>
				<VisuallyHidden render={ <Popover.Title /> }>{ label }</VisuallyHidden>
				<IconButton
					ref={ buttonRef }
					variant="minimal"
					tone="neutral"
					label={ label }
					size="compact"
					icon={ trash }
					onClick={ onClick }
					onKeyDown={ ( event: KeyboardEvent ) => {
						// Move focus back to the editor canvas as if the remover were placed right after the anchor.
						if ( event.key === 'Escape' || ( event.key === 'Tab' && event.shiftKey ) ) {
							event.preventDefault();
							event.stopPropagation();
							focusElement( anchor );
						} else if ( event.key === 'Tab' ) {
							event.preventDefault();
							event.stopPropagation();
							focusElement( findNextTabbable( anchor ) ?? anchor );
						}
					} }
				/>
			</Popover.Popup>
		</Popover.Root>
	);
}
