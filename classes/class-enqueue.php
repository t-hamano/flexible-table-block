<?php
/**
 * @package Flexible_Table_Block;
 * @author Aki Hamano
 * @license GPL-2.0+
 */

namespace Flexible_Table_Block;

class Enqueue {

	/**
	 * Whether the block CSS has already been added to the front-end style
	 *
	 * @var bool
	 */
	private $is_style_css_added = false;

	/**
	 * Constructor
	 */
	public function __construct() {
		// Register block.
		add_action( 'init', array( $this, 'register_block' ) );

		// Add block CSS to the front-end style before it is printed in the head.
		add_action( 'wp_enqueue_scripts', array( $this, 'add_block_css_to_style_in_head' ) );

		// Add block CSS to the front-end style when the block is rendered.
		add_filter( 'render_block_flexible-table-block/table', array( $this, 'add_block_css_to_style_on_render' ) );

		// Add block CSS to the block editor styles.
		add_filter( 'block_editor_settings_all', array( $this, 'add_block_css_to_editor_settings' ) );
	}

	/**
	 * Register block
	 */
	public function register_block() {
		register_block_type( FTB_PATH . '/build' );
	}

	/**
	 * Add block CSS to the front-end style before it is printed in the head
	 *
	 * When block assets are not loaded on demand, WordPress enqueues the style of every
	 * registered block and prints it in the head, which can be before the block is rendered.
	 */
	public function add_block_css_to_style_in_head() {
		if ( ! wp_should_load_block_assets_on_demand() ) {
			$this->add_block_css_to_style();
		}
	}

	/**
	 * Add block CSS to the front-end style when the block is rendered
	 *
	 * When block assets are loaded on demand, the style is only enqueued when the block
	 * is rendered, so the CSS is generated on the first render instead of on every request.
	 *
	 * @param string $block_content The block content.
	 * @return string
	 */
	public function add_block_css_to_style_on_render( $block_content ) {
		$this->add_block_css_to_style();

		return $block_content;
	}

	/**
	 * Add block CSS to the front-end style once per request
	 */
	private function add_block_css_to_style() {
		if ( $this->is_style_css_added ) {
			return;
		}

		$responsive_css = Helper::get_responsive_css();
		$block_css      = Helper::get_block_css();
		$css            = Helper::minify_css( $block_css . $responsive_css );

		wp_add_inline_style( generate_block_asset_handle( 'flexible-table-block/table', 'style' ), $css );

		$this->is_style_css_added = true;
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
	public function add_block_css_to_editor_settings( $settings ) {
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
