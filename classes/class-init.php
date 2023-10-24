<?php
/**
 * @package Flexible_Table_Block;
 * @author Aki Hamano
 * @license GPL-2.0+
 */

namespace Flexible_Table_Block;

class Init {

	/**
	 * Constructor
	 */
	public function __construct() {
		// Load translated strings.
		load_plugin_textdomain( FTB_NAMESPACE );

		// Uninstallation process.
		register_uninstall_hook( FTB_NAMESPACE, __NAMESPACE__ . '\Init::plugin_uninstall' );

		// Load classes.
		$this->load_classes();
	}

	/**
	 * Uninstallation process
	 */
	public static function plugin_uninstall() {
		foreach ( Settings::OPTIONS as $option ) {
			delete_option( $option );
		}
	}

	/**
	 * Load classes
	 */
	public function load_classes() {
		require_once FTB_PATH . '/classes/class-helper.php';
		require_once FTB_PATH . '/classes/class-settings.php';
		require_once FTB_PATH . '/classes/class-enqueue.php';
		require_once FTB_PATH . '/classes/class-api.php';
	}
}
