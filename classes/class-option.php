<?php
/**
 * @package Flexible_Table_Block;
 * @author Aki Hamano
 * @license GPL-2.0+
 */

namespace Flexible_Table_Block;

class Option {

	// Names of the options this plugin stores.
	// Kept dependency-free so it can be loaded standalone from uninstall.php.
	const OPTION_NAMES = array(
		'show_label_on_section' => 'flexible_table_block_show_label_on_section',
		'show_control_button'   => 'flexible_table_block_show_control_button',
		'focus_control_button'  => 'flexible_table_block_focus_control_button',
		'show_dot_on_th'        => 'flexible_table_block_show_dot_on_th',
		'tab_move'              => 'flexible_table_block_tab_move',
		'merge_content'         => 'flexible_table_block_merge_content',
		'show_global_setting'   => 'flexible_table_block_show_global_setting',
		'breakpoint'            => 'flexible_table_block_breakpoint',
		'block_style'           => 'flexible_table_block_block_style',
	);
}
