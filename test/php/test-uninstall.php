<?php
/**
 * @package Flexible_Table_Block
 */

use Flexible_Table_Block\Option;

/**
 * Tests for uninstall.php.
 */
class Test_Uninstall extends WP_UnitTestCase {

	/**
	 * Tests that uninstalling deletes all options of the plugin.
	 */
	public function test_uninstall_deletes_all_options() {
		foreach ( Option::OPTION_NAMES as $option_name ) {
			update_option( $option_name, 'value' );
		}
		update_option( 'unrelated_option', 'value' );

		if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
			define( 'WP_UNINSTALL_PLUGIN', 'flexible-table-block/flexible-table-block.php' );
		}

		require dirname( __DIR__, 2 ) . '/uninstall.php';

		foreach ( Option::OPTION_NAMES as $option_name ) {
			$this->assertFalse( get_option( $option_name ), "{$option_name} should be deleted." );
		}

		$this->assertSame( 'value', get_option( 'unrelated_option' ) );
	}

	/**
	 * Tests that every option defined in the settings has an option name to delete.
	 */
	public function test_option_names_cover_all_settings() {
		$this->assertEqualsCanonicalizing(
			array_keys( Flexible_Table_Block\Settings::OPTIONS ),
			array_keys( Option::OPTION_NAMES )
		);
	}
}
