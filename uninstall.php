<?php
/**
 * @package Flexible_Table_Block
 * @author Aki Hamano
 * @license GPL-2.0+
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

require_once __DIR__ . '/classes/class-option.php';

foreach ( Flexible_Table_Block\Option::OPTION_NAMES as $option_name ) {
	delete_option( $option_name );
}
