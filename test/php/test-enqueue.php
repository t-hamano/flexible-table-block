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
	 * Tests that the block CSS is added to the front-end style.
	 */
	public function test_block_css_is_added_to_style() {
		( new Enqueue() )->add_block_css_to_style();

		$this->assertSame(
			array( Helper::minify_css( Helper::get_block_css() . Helper::get_responsive_css() ) ),
			wp_styles()->get_data( self::STYLE_HANDLE, 'after' )
		);
	}
}
