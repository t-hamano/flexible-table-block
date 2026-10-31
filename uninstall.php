<?php
/**
 * @package Flexible_Table_Block
 * @author Aki Hamano
 * @license GPL-2.0+
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

require_once __DIR__ . '/classes/class-settings.php';

foreach ( array_keys( Flexible_Table_Block\Settings::OPTIONS ) as $key ) {
	delete_option( Flexible_Table_Block\Settings::get_option_name( $key ) );
}
