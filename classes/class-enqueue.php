<?php
/**
 * @package Flexible_Table_Block;
 * @author Aki Hamano
 * @license GPL-2.0+
 */

namespace Flexible_Table_Block;

class Enqueue {

	/**
	 * Constructor
	 */
	public function __construct() {
		// Register block.
		add_action( 'init', array( $this, 'register_block' ) );

		// Enqueue front-end scripts.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		// Enqueue block-editor assets.
		if ( is_admin() ) {
			add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_editor_assets' ) );
		}
	}

	/**
	 * Register block
	 */
	public function register_block() {
		register_block_type( FTB_PATH . '/build' );
	}

	/**
	 * Enqueue front-end scripts
	 */
	public function enqueue_scripts() {
		wp_register_style(
			'flexible-table-block',
			FTB_URL . '/build/style-index.css',
			array(),
			filemtime( FTB_PATH . '/build/style-index.css' ),
		);

		$responsive_css = Helper::get_responsive_css();
		$block_css      = Helper::get_block_css( '.' . FTB_BLOCK_CLASS );
		$css            = Helper::minify_css( $block_css . $responsive_css );

		wp_add_inline_style( 'flexible-table-block', $css );
	}

	/**
	 * Enqueue block-editor assets
	 */
	public function enqueue_block_editor_assets() {
		$asset_file = include FTB_PATH . '/build/index.asset.php';

		wp_register_script(
			'flexible-table-block-editor',
			FTB_URL . '/build/index.js',
			$asset_file['dependencies'],
			filemtime( FTB_PATH . '/build/index.js' ),
		);

		wp_set_script_translations( 'flexible-table-block-editor', FTB_NAMESPACE );

		wp_register_style(
			'flexible-table-block-editor',
			FTB_URL . '/build/index.css',
			array(),
			filemtime( FTB_PATH . '/build/index.css' ),
		);

		$block_css = Helper::get_block_css( '.editor-styles-wrapper ' );
		$css       = Helper::minify_css( $block_css );

		wp_add_inline_style( 'flexible-table-block-editor', $css );
	}
}

new Enqueue();
