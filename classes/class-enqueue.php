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
	function __construct() {
		// Register block & scripts.
		add_action( 'init', array( $this, 'register_block' ) );

		// Enqueue front-end inline style.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		// Enqueue block-editor inline style.
		// TODO: Once the minimum WordPress version supported by the plugin is 6.3 or higher,
		// enqueue_block_editor_assets will be removed.
		if ( is_wp_version_compatible( '6.3' ) ) {
			add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_editor_assets' ) );
		} else {
			add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
		}
	}

	/**
	 * Register block & scripts
	 */
	public function register_block() {
		register_block_type( FTB_PATH . '/build' );
	}

	/**
	 * Enqueue front-end inline style
	 */
	public function enqueue_scripts() {
		$responsive_css = Helper::get_responsive_css();
		$block_css      = Helper::get_block_css( '.' . FTB_BLOCK_CLASS );
		$css            = Helper::minify_css( $block_css . $responsive_css );

		wp_add_inline_style( 'flexible-table-block-table-style', $css );
	}

	/**
	 * Enqueue block-editor inline style
	 */
	public function enqueue_block_editor_assets() {
		$block_css = Helper::get_block_css( '.editor-styles-wrapper ' );
		$css       = Helper::minify_css( $block_css );

		wp_set_script_translations( 'flexible-table-block-table-editor-script', FTB_NAMESPACE );
		wp_add_inline_style( 'flexible-table-block-table-editor-style', $css );
	}
}

new Enqueue();
