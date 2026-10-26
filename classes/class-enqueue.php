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

		// Add block CSS to the block editor styles.
		add_filter( 'block_editor_settings_all', array( $this, 'add_editor_styles' ) );
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
		$responsive_css = Helper::get_responsive_css();
		$block_css      = Helper::get_block_css();
		$css            = Helper::minify_css( $block_css . $responsive_css );

		wp_add_inline_style( generate_block_asset_handle( 'flexible-table-block/table', 'viewStyle' ), $css );
	}

	/**
	 * Add block CSS to the block editor styles
	 *
	 * Styles passed via the editor settings are rendered inside the editor canvas,
	 * whether it is iframed or not, and can be updated from the client side.
	 * A non-`theme` `__unstableType` keeps them applied even if theme styles are disabled.
	 * The CSS is prepended so that theme and user styles still come after it, as with the
	 * previous inline style loaded in the canvas `<head>`.
	 *
	 * @param array $settings Block editor settings.
	 * @return array
	 */
	public function add_editor_styles( $settings ) {
		$settings['styles'] = array_merge(
			array(
				array(
					'css'                => Helper::minify_css( Helper::get_block_css() ),
					'__unstableType'     => 'plugin',
					'flexibleTableBlock' => true,
				),
			),
			$settings['styles'] ?? array()
		);

		return $settings;
	}
}
