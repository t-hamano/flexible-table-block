/**
 * External dependencies
 */
import type { Dispatch, SetStateAction } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { Dialog, Stack, Text, Link } from '@wordpress/ui';
import { isAppleOS } from '@wordpress/keycodes';

type Props = {
	setIsHelpModalOpen: Dispatch< SetStateAction< boolean > >;
};

export default function HelpModal( { setIsHelpModalOpen }: Props ) {
	return (
		<Dialog.Root open onOpenChange={ ( open ) => ! open && setIsHelpModalOpen( false ) }>
			<Dialog.Popup size="medium">
				<Dialog.Header>
					<Dialog.Title>{ __( 'Flexible Table Block help', 'flexible-table-block' ) }</Dialog.Title>
					<Dialog.CloseIconButton />
				</Dialog.Header>
				<Dialog.Content>
					<Stack direction="column" gap="lg">
						<Stack direction="column" gap="sm">
							<Text variant="heading-md" render={ <h5 /> }>
								{ __( 'About default table styles', 'flexible-table-block' ) }
							</Text>
							<Text render={ <p /> }>
								{ __(
									'Flexible Table Block allows you to create tables in various styles. First, we recommend setting the default table styles in "Global settings".',
									'flexible-table-block'
								) }
							</Text>
						</Stack>
						<Stack direction="column" gap="sm">
							<Text variant="heading-md" render={ <h5 /> }>
								{ __( 'Select multiple cells', 'flexible-table-block' ) }
							</Text>
							<Text render={ <p /> }>
								{ createInterpolateElement(
									isAppleOS()
										? __(
												'Hold the <code>Command</code> key to select multiple cells. Hold the <code>Shift</code> key to select a range. You can merge the selected cells or change their styles at once.',
												'flexible-table-block'
											)
										: __(
												'Hold the <code>Ctrl</code> key to select multiple cells. Hold the <code>Shift</code> key to select a range. You can merge the selected cells or change their styles at once.',
												'flexible-table-block'
											),
									{ code: <code /> }
								) }
							</Text>
						</Stack>
						<Stack direction="column" gap="sm">
							<Text variant="heading-md" render={ <h5 /> }>
								{ __( 'About scrollable tables', 'flexible-table-block' ) }
							</Text>
							<Text render={ <p /> }>
								{ __(
									'If table scrolling is enabled, set "Table width" or "Table min width" larger than the content width.',
									'flexible-table-block'
								) }
							</Text>
						</Stack>
						<Stack direction="column" gap="sm">
							<Text variant="heading-md" render={ <h5 /> }>
								{ __( 'About accessibility', 'flexible-table-block' ) }
							</Text>
							<Text render={ <p /> }>
								{ createInterpolateElement(
									__(
										'Properly defining the <code>id</code>, <code>headers</code>, and <code>scope</code> attributes for each cell helps screen readers convey the table structure accurately.',
										'flexible-table-block'
									),
									{ code: <code /> }
								) }
							</Text>
							<Text render={ <p /> }>
								{ createInterpolateElement(
									__(
										'Refer to <Link>this page</Link> for the specifications of each attribute.',
										'flexible-table-block'
									),
									{
										Link: (
											<Link
												openInNewTab
												href={ __(
													'https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Advanced',
													'flexible-table-block'
												) }
											/>
										),
									}
								) }
							</Text>
						</Stack>
					</Stack>
				</Dialog.Content>
			</Dialog.Popup>
		</Dialog.Root>
	);
}
