=== Flexible Table Block ===
Contributors: wildworks, Toro_Unit
Tags: gutenberg, block, table
Donate link: https://www.paypal.me/thamanoJP
Requires at least: 5.8
Tested up to: 6.0
Stable tag: 2.7.2
Requires PHP: 7.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Flexible Table Block is a custom block plugin for the WordPress block editor that allows you to create tables in any configuration.

== Description ==

**Merge and Split Cells**

You can merge or split cells from multiple selected cells.

**Flexible Styling**

You can set various styles for each tag of table, cell, and caption indivisually.

**Advanced UI**

You can easily select a batch of cells in a section, or select, add, or delete rows and columns with the buttons.

**Responsive Support**

You can set the table to scroll horizontally on both Desktop and mobile, and arrange cells vertically on mobile.
The breakpoints for switching between Desktop and mobile can be changed freely.

== Installation ==
1. Upload the `flexible-table-block` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the \'Plugins\' menu in WordPress.

== Screenshots ==
1. Merge and Split Cells
2. Flexible Styling
3. Advanced UI
4. Responsive Support

== Changelog ==

= 2.7.2 =
* Change: Style to break lines in cells

= 2.7.1 =
* Change: Don't update cell tag when cell settings are cleared
* Fix: Certain operations break the block

= 2.7.0 =
* Add: id, headers, scope attribute controls to cell settings
* Fix: Browser warning error
* Fix: Not transformed to core table block correctly

= 2.6.2 =
* Fix: Scrolli table doesn't show edges
* Add: Help text about scroll table
* Add: Style to break lines in cells

= 2.6.1 =
* Tested to WordPress 6.0
* Fix: Clearing the table settings and then saving the post breaks the block
* Fix: Adjust indicator style

= 2.6.0 =
* Add: Margin support
* Fix: Cell CSS class is not cleared when cell settings are cleared
* Fix: Output of incorrect inline CSS

= 2.5.3 =
* Fix: Cell CSS class is reset

= 2.5.2 =
* Update: Block preview
* Fix: Error when installing from block directory

= 2.5.0 =
* Add: Option to move cells with the tab key
* Fix: Cell content is not updated under certain conditions

= 2.4.0 =
* Tested to WordPress 5.9
* Add: Block supports (link color, text-transform, font-style, font-weight, letter-spacing)
* Fix: Zero values are not saved correctly in global settings
* Fix: Changes to global settings are not reflected in iframe editor instances

= 2.3.1 =
* Fix: Table justify icon does not appear
* Fix: Incorrect indigator direction

= 2.3.0 =
* Enhancement: Support for individual values in cell padding of global settings
* Fix: Unable to deselect selected cells by clicking with the Ctrl key
* Fix: Cell width is not set to 100% when 'Stack on mobile' is enabled
* Fix: Accessibility support for controls

= 2.2.0 =
* Add: Option to merge content when merging cells

= 2.1.2 =
* Fix: Global settings options are not saved

= 2.1.1 =
* Fix: Adjust indicator style
* Fix: Cell Line Height setting is not cleared

= 2.1.0 =
* Add: Cell line-height control

= 2.0.9 =
* Doc: Add translate context

= 2.0.8 =
* Fix: Accessibility support for controls, fix typo

= 2.0.7 =
* Fix: Missing text translation
* Fix: Button text layout in popover is broken
* Fix: Text in JavaScript is not translated

= 2.0.6 =
* Fix: typo

= 2.0.5 =
* Fix: deploy action

= 2.0.4 =
* Fix: deploy action

= 2.0.3 =
* Fix: deploy action

= 2.0.2 =
* Fix: deploy action

= 2.0.1 =
* Doc: add LICENSE
* Clean: add deploy action
* Clean: refactoring: edit.js to edit.tsx

= 2.0.0 =
* Initial release
