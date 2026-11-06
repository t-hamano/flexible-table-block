<?php
/**
 * @package Flexible_Table_Block
 */

use Flexible_Table_Block\Enqueue;
use Flexible_Table_Block\Helper;

/**
 * Tests for the Enqueue class.
 */
class Test_Enqueue extends WP_UnitTestCase {

	const STYLE_HANDLE = 'flexible-table-block-table-style';

	/**
	 * Whether the style handle was registered by this test case.
	 *
	 * @var bool
	 */
	private $is_handle_registered_by_test = false;

	/**
	 * Registers the style handle if needed and removes its inline CSS.
	 *
	 * The block, and so its style handle, is only registered when the plugin is built.
	 */
	public function set_up() {
		parent::set_up();

		if ( ! wp_style_is( self::STYLE_HANDLE, 'registered' ) ) {
			wp_register_style( self::STYLE_HANDLE, false, array(), null );
			$this->is_handle_registered_by_test = true;
		}

		unset( wp_styles()->registered[ self::STYLE_HANDLE ]->extra['after'] );
	}

	/**
	 * Removes the inline CSS and the style handle registered by this test case.
	 */
	public function tear_down() {
		if ( $this->is_handle_registered_by_test ) {
			wp_deregister_style( self::STYLE_HANDLE );
		} else {
			unset( wp_styles()->registered[ self::STYLE_HANDLE ]->extra['after'] );
		}

		parent::tear_down();
	}

	/**
	 * Returns the inline CSS expected to be added to the style.
	 *
	 * @return string[]
	 */
	private function get_expected_inline_css() {
		return array( Helper::minify_css( Helper::get_block_css() . Helper::get_responsive_css() ) );
	}

	/**
	 * Tests that the front-end style is a block style, which is also printed in the head
	 * when block assets are not loaded on demand.
	 */
	public function test_front_end_style_is_registered_as_block_style() {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'flexible-table-block/table' );

		if ( ! $block_type ) {
			$this->markTestSkipped( 'The block is only registered when the plugin is built.' );
		}

		$this->assertSame( array( self::STYLE_HANDLE ), $block_type->style_handles );
		$this->assertSame( array(), $block_type->view_style_handles );
	}

	/**
	 * Tests that the block CSS is added before the head when block assets are not loaded on demand.
	 */
	public function test_block_css_is_added_in_head_when_block_assets_are_not_loaded_on_demand() {
		add_filter( 'should_load_block_assets_on_demand', '__return_false' );

		( new Enqueue() )->add_block_css_to_style_in_head();

		$this->assertSame( $this->get_expected_inline_css(), wp_styles()->get_data( self::STYLE_HANDLE, 'after' ) );
	}

	/**
	 * Tests that the block CSS is not added before the head when block assets are loaded on demand.
	 */
	public function test_block_css_is_not_added_in_head_when_block_assets_are_loaded_on_demand() {
		add_filter( 'should_load_block_assets_on_demand', '__return_true' );

		( new Enqueue() )->add_block_css_to_style_in_head();

		$this->assertFalse( wp_styles()->get_data( self::STYLE_HANDLE, 'after' ) );
	}

	/**
	 * Tests that the block CSS is added only once when the block is rendered.
	 */
	public function test_block_css_is_added_once_on_render() {
		$enqueue = new Enqueue();

		$this->assertSame( '<figure></figure>', $enqueue->add_block_css_to_style_on_render( '<figure></figure>' ) );
		$enqueue->add_block_css_to_style_on_render( '<figure></figure>' );

		$this->assertSame( $this->get_expected_inline_css(), wp_styles()->get_data( self::STYLE_HANDLE, 'after' ) );
	}

	/**
	 * Tests that the block CSS added before the head is not added again when the block is rendered.
	 */
	public function test_block_css_added_in_head_is_not_added_again_on_render() {
		add_filter( 'should_load_block_assets_on_demand', '__return_false' );

		$enqueue = new Enqueue();
		$enqueue->add_block_css_to_style_in_head();
		$enqueue->add_block_css_to_style_on_render( '<figure></figure>' );

		$this->assertSame( $this->get_expected_inline_css(), wp_styles()->get_data( self::STYLE_HANDLE, 'after' ) );
	}
}
