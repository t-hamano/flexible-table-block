=== Flexible Table Block ===
Contributors: wildworks, Toro_Unit
Tags: gutenberg, block, table
Donate link: https://www.paypal.me/thamanoJP
Requires at least: 7.1
Tested up to: 7.1
Stable tag: 3.9.0
Requires PHP: 8.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Flexible Table Block is a custom block plugin for the WordPress block editor that allows you to create tables in any configuration.

== Description ==

**Merge Cells and Intuitive Selection**

You can merge multiple selected cells or split merged cells. You can also select a range of cells within a section at once, and select, add, or delete rows and columns with buttons.

**Flexible Styling and Responsive Support**

You can set various styles for the table, cells, and caption individually. You can also make the table scroll horizontally on desktop, mobile, or both, and stack cells vertically on mobile. The breakpoint between desktop and mobile can be customized.

**Global Default Styles**

You can set the default styles for tables and cells across the entire site.

**Editor Options**

You can change the editor behavior, such as whether to show section labels and control buttons, or whether to move between cells with the Tab key.

== Installation ==

1. Upload the `flexible-table-block` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.

== Screenshots ==
1. Merge Cells and Intuitive Selection
2. Flexible Styling and Responsive Support
3. Global Default Styles
4. Editor Options

== Resources ==

= Banner image =

* License: CC BY 2.0
* Author: mripp
* Source: https://openverse.org/image/5438640e-83e1-4759-8691-1f87086fd651

== Changelog ==

= 3.9.0 =
* Tested up to WordPress 7.1
* Drop support for WordPress 6.9
* Fix: Width of the cell width input field
* a11y: Announce row and column selection state to screen readers

= 3.8.0 =
* Security: Sanitize CSS values in global style settings
* Fix: Improve permission checks for global settings
* a11y: Revert focusing the first cell when inserting or deleting a row or column

= 3.7.0 =
* Tested up to WordPress 7.0
* Drop support for WordPress 6.8

= 3.6.0 =
* Tested up to WordPress 6.9
* Drop support for WordPress 6.6 and 6.7
* Enhancement: Remove reset buttons
* Enhancement: Improve accessibility of cell alignment setting
* Enhancement: Parse CSS values more accurately
* Enhancement: Add CSS classes to panels and sections
* Enhancement: Update icons
* Enhancement: Focus the first cell when inserting or deleting a row or column
* Enhancement: Show a message when no cells are selected
* Enhancement: Add table min height setting
* Enhancement: Show font size setting by default
* Fix: Clearing table settings does not reset the "Fixed width table cells" setting to the default
* Fix: Deselection does not work correctly in the border style control
* Fix: Input field order in the border radius control

= 3.5.0 =
* Tested up to WordPress 6.8
* Drop support for WordPress 6.5
* Enhancement: Replace deprecated UI with recommended UI

= 3.4.0 =
* Tested up to WordPress 6.7
* Drop support for WordPress 6.4
* Enhancement: Add caption toolbar button
* Enhancement: Update icons
* Enhancement: Improve accessibility
* Enhancement: Improve hint text
* Enhancement: Add box-sizing

= 3.3.0 =
* Tested up to WordPress 6.6
* Drop support for WordPress 6.3
* Enhancement: Support content-only mode
* Enhancement: Update block API version from 2 to 3

= 3.2.0 =
* Tested up to WordPress 6.5
* Drop support for WordPress 6.2
* Enhancement: Polish block sidebar UI
* Enhancement: Polish UI in the Global Settings modal

= 3.1.0 =
* Tested up to WordPress 6.4
* Drop support for WordPress 6.1
* Enhancement: Use Snackbar component instead of window.alert
* Fix: Some block styles are not carried over when transforming the block

= 3.0.1 =
* Fix: Keyboard controls don't work within the link control popover
* Fix: Tab key focus doesn't work when cell text contains footnote links
* Enhancement: Release cell selection when the block is unselected

= 3.0.0 =
* Tested up to WordPress 6.3
* Fix: Missing top border in the block sidebar
* Fix: Some grammatical errors
* Fix: Incorrect pixel value in description about breakpoint
* Fix: Popovers in the Global Settings modal are not showing in the Site Editor
* Fix: Cursor style when mousing over RichText in the cell
* Clean: Remove link to wiki page in help modal
* Drop support for WordPress 5.9 and 6.0
* Drop support for PHP 7.3

= 2.9.1 =
* Enhancement: Adjust tab width in the Global Settings modal

= 2.9.0 =
* Tested up to WordPress 6.2
* Enhancement: Redesign the Global Settings modal
* Enhancement: Keep rowspan and colspan attributes when converting to and from the core table block
* Enhancement: Apply stripe colors to tbody only
* Enhancement: Polish style for WordPress 6.2
* Fix: Link color is not applied

= 2.8.0 =
* Tested up to WordPress 6.1
* Drop support for WordPress 5.8
* Enhancement: Polish block sidebar UI
* Enhancement: Polish UI in the Global Settings modal
* Doc: Use code tags in some text
* Fix: Don't apply typography support styles to the placeholder
* Fix: register_block_type path

= 2.7.3 =
* Enhancement: Add loading state to the Global Settings button
* Clean: Use code tags for text in the options section
* Fix: Overflow of input field in placeholder
* Fix: Block toolbar doesn't appear in HTML edit mode

= 2.7.2 =
* Change: Style to break lines in cells

= 2.7.1 =
* Change: Don't update cell tag when cell settings are cleared
* Fix: Certain operations break the block

= 2.7.0 =
* Feature: Add id, headers, and scope attribute controls to cell settings
* Fix: Browser warning
* Fix: Block is not correctly transformed to the core table block

= 2.6.2 =
* Fix: Scrollable table doesn't show edges
* Enhancement: Add help text about scrollable tables
* Enhancement: Add style to break lines in cells

= 2.6.1 =
* Tested up to WordPress 6.0
* Fix: Clearing the table settings and then saving the post breaks the block
* Fix: Adjust indicator style

= 2.6.0 =
* Feature: Add margin support
* Fix: Cell CSS class is not cleared when cell settings are cleared
* Fix: Incorrect inline CSS output

= 2.5.3 =
* Fix: Cell CSS class is reset

= 2.5.2 =
* Update: Block preview
* Fix: Error when installing from the block directory

= 2.5.0 =
* Feature: Add option to move between cells with the Tab key
* Fix: Cell content is not updated under certain conditions

= 2.4.0 =
* Tested up to WordPress 5.9
* Feature: Add block supports (link color, text-transform, font-style, font-weight, letter-spacing)
* Fix: Zero values are not saved correctly in global settings
* Fix: Changes to global settings are not reflected in iframe editor instances

= 2.3.1 =
* Fix: Table justify icon does not appear
* Fix: Incorrect indicator direction

= 2.3.0 =
* Enhancement: Support individual values for cell padding in global settings
* Fix: Unable to deselect selected cells by clicking with the Ctrl key
* Fix: Cell width is not set to 100% when 'Stack on mobile' is enabled
* Fix: Accessibility support for controls

= 2.2.0 =
* Feature: Add option to merge content when merging cells

= 2.1.2 =
* Fix: Global settings are not saved

= 2.1.1 =
* Fix: Adjust indicator style
* Fix: Cell line height setting is not cleared

= 2.1.0 =
* Feature: Add cell line-height control

= 2.0.9 =
* Doc: Add translation context

= 2.0.8 =
* Fix: Accessibility support for controls
* Fix: Typo

= 2.0.7 =
* Fix: Missing text translation
* Fix: Button text layout in popover is broken
* Fix: Text in JavaScript is not translated

= 2.0.6 =
* Fix: Typo

= 2.0.5 =
* Fix: Deploy action

= 2.0.4 =
* Fix: Deploy action

= 2.0.3 =
* Fix: Deploy action

= 2.0.2 =
* Fix: Deploy action

= 2.0.1 =
* Doc: Add LICENSE
* Clean: Add deploy action
* Clean: Refactor edit.js to edit.tsx

= 2.0.0 =
* Initial release
