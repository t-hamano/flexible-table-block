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

		// Enqueue front-end inline styles
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		// Enqueue block-editor inline styles
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
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
			)
		);
	}

	/**
	 * Enqueue front-end inline styles.
	 */
	public function enqueue_scripts() {
		$block_css = get_option( FTB_OPTION_PREFIX . '_css', Settings::OPTIONS['css']['default'] );

		$breakpoint = get_option( FTB_OPTION_PREFIX . '_breakpoint', Settings::OPTIONS['breakpoint']['default'] );
		$common_css = Helper::get_common_css( $breakpoint );

		// Filters to override common CSS.
		$common_css = apply_filters( 'flexible_table_block_common_css', $common_css, $breakpoint );

		$css = Helper::minify_css( $block_css . $common_css );
		wp_register_style( FTB_NAMESPACE, false );
		wp_enqueue_style( FTB_NAMESPACE );
		wp_add_inline_style( FTB_NAMESPACE, $css );
	}

	/**
	 * Enqueue block-editor inline styles.
	 */
	public function enqueue_block_editor_assets() {
		$block_css = get_option( FTB_OPTION_PREFIX . '_css', Settings::OPTIONS['css']['default'] );
		$block_css = Helper::minify_css( $block_css );
		wp_add_inline_style( FTB_NAMESPACE . '-editor', $block_css );
	}
}

new Enqueue();
