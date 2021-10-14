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
		// Register block.
		add_action( 'init', array( $this, 'register_block' ) );

		// Enqueue front-end scripts.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		// Enqueue block-editor scripts.
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
	}

	/**
	 * Register block
	 */
	public function register_block() {
		register_block_type( FTB_PATH . '/src' );
	}

	/**
	 * Enqueue front-end scripts
	 */
	public function enqueue_scripts() {
		wp_enqueue_style(
			FTB_NAMESPACE,
			FTB_URL . '/build/style-index.css',
			array(),
			filemtime( FTB_PATH . '/build/style-index.css' ),
		);

		// Output dynamic styles based on global settings.
		$responsive_css = Helper::get_responsive_css();
		$block_css      = Helper::get_block_css( '.' . FTB_BLOCK_CLASS );
		$css            = Helper::minify_css( $block_css . $responsive_css );
		wp_add_inline_style( FTB_NAMESPACE, $css );
	}

	/**
	 * Enqueue block-editor scripts
	 */
	public function enqueue_block_editor_assets() {
		$asset_file = include( FTB_PATH . '/build/index.asset.php' );

		wp_enqueue_style(
			FTB_NAMESPACE,
			FTB_URL . '/build/index.css',
			array(),
			filemtime( FTB_PATH . '/build/index.css' ),
		);

		wp_enqueue_script(
			FTB_NAMESPACE,
			FTB_URL . '/build/index.js',
			$asset_file['dependencies'],
			filemtime( FTB_PATH . '/build/index.js' ),
		);

		// Output dynamic styles based on global settings.
		$block_css = Helper::get_block_css( '.editor-styles-wrapper ' );
		$css       = Helper::minify_css( $block_css );
		wp_add_inline_style( FTB_NAMESPACE, $css );
	}
}

new Enqueue();
