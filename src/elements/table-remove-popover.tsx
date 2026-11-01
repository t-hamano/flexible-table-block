/**
 * External dependencies
 */
import type { KeyboardEvent, MouseEvent } from 'react';

/**
 * WordPress dependencies
 */
import { IconButton, Popover, VisuallyHidden } from '@wordpress/ui';
import { trash } from '@wordpress/icons';

type Props = {
	className: string;
	label: string;
	anchor: HTMLElement | null;
	side: 'top' | 'left';
	tabIndex: number;
	onClick: ( event: MouseEvent ) => void;
};

// Render the remover in a popover so that it is not cut off by the edge of the editor canvas,
// e.g. when the table is full width.
export default function TableRemovePopover( {
	className,
	label,
	anchor,
	side,
	tabIndex,
	onClick,
}: Props ) {
	if ( ! anchor ) {
		return null;
	}

	// When control buttons are focusable, move focus to the remover so that keyboard users can reach it.
	const isFocusable = tabIndex === 0;

	return (
		<Popover.Root open>
			<Popover.Popup
				className={ className }
				initialFocus={ isFocusable }
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
					variant="minimal"
					tone="neutral"
					label={ label }
					tabIndex={ tabIndex }
					size="compact"
					icon={ trash }
					onClick={ onClick }
					onKeyDown={ ( event: KeyboardEvent ) => {
						// The popover stays open while the row or column is selected,
						// so only move focus back to the anchor.
						if ( event.key === 'Escape' ) {
							anchor.focus();
							event.stopPropagation();
						}
					} }
				/>
			</Popover.Popup>
		</Popover.Root>
	);
}
