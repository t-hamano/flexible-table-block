<?php
/**
 * @package Flexible_Table_Block
 */

use Flexible_Table_Block\Settings;

/**
 * Tests for uninstall.php.
 */
class Test_Uninstall extends WP_UnitTestCase {

	/**
	 * Tests that uninstalling deletes all options of the plugin.
	 */
	public function test_uninstall_deletes_all_options() {
		foreach ( array_keys( Settings::OPTIONS ) as $key ) {
			update_option( Settings::OPTION_PREFIX . $key, 'value' );
		}
		update_option( 'unrelated_option', 'value' );

		if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
			define( 'WP_UNINSTALL_PLUGIN', 'flexible-table-block/flexible-table-block.php' );
		}

		require dirname( __DIR__, 2 ) . '/uninstall.php';

		foreach ( array_keys( Settings::OPTIONS ) as $key ) {
			$option_name = Settings::OPTION_PREFIX . $key;
			$this->assertFalse( get_option( $option_name ), "{$option_name} should be deleted." );
		}

		$this->assertSame( 'value', get_option( 'unrelated_option' ) );
	}
}
