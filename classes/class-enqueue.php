<?php
/**
 * @package flexible-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

namespace flexible_table_block;

class Enqueue {

	/**
	 * Constructor
	 */
	function __construct() {
		// Register block
		add_action( 'init', array( $this, 'register_block' ) );
	}

	/**
	 * Register block, scripts, styles
	 */
	public function register_block() {
		$asset_file = include( FTB_PATH . '/build/index.asset.php' );

		wp_register_style(
			FTB_NAMESPACE . '-editor',
			FTB_URL . '/build/index.css',
			array(),
			filemtime( FTB_PATH . '/build/index.css' ),
		);

		wp_register_style(
			FTB_NAMESPACE,
			FTB_URL . '/build/style-index.css',
			array(),
			filemtime( FTB_PATH . '/build/style-index.css' ),
		);

		wp_register_script(
			FTB_NAMESPACE,
			FTB_URL . '/build/index.js',
			$asset_file['dependencies'],
			$asset_file['version']
		);

		register_block_type(
			FTB_PATH . '/src',
			array(
				'editor_script' => FTB_NAMESPACE,
				'editor_style'  => FTB_NAMESPACE . '-editor',
				'style'         => FTB_NAMESPACE,
			)
		);
	}
}

new Enqueue();
