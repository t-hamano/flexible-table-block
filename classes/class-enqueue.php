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
		// Register block.
		add_action( 'init', array( $this, 'register_block' ) );

		// Enqueue front-end scripts.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		// Enqueue block-editor scripts.
		// TODO: Once the minimum WordPress version supported by the plugin is 6.3 or higher,
		// Use enqueue_block_assets instead of enqueue_block_editor_assets.
		// See: https://github.com/t-hamano/flexible-table-block/pull/161/commits/c2ce9851eb0812e7a2a3e660555ab553c5c3e8e3
		// See: https://github.com/t-hamano/flexible-table-block/pull/161/commits/0019f8c961f04ba95a7447149eb8dab61fbcd0ee
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
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
	 * Enqueue block-editor scripts
	 */
	public function enqueue_block_editor_assets() {
		$asset_file = include( FTB_PATH . '/build/index.asset.php' );

		wp_register_script(
			'flexible-table-block-editor',
			FTB_URL . '/build/index.js',
			$asset_file['dependencies'],
			filemtime( FTB_PATH . '/build/index.js' ),
		);

		wp_localize_script(
			'flexible-table-block-editor',
			'ftbObj',
			array(
				'useOnFocus' => is_wp_version_compatible( '6.3' ),
			)
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
