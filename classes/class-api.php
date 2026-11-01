<?php
/**
 * @package Flexible_Table_Block
 * @author Aki Hamano
 * @license GPL-2.0+
 */

namespace Flexible_Table_Block;

use WP_Error;
use WP_REST_Response;

class Api {

	/**
	 * Constructor
	 */
	public function __construct() {
		// Register REST API route.
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {

		register_rest_route(
			FTB_NAMESPACE . '/v1',
			'/options',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_options' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_options' ),
					'permission_callback' => array( $this, 'can_update_options' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_options' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
				),
			)
		);

		register_rest_route(
			FTB_NAMESPACE . '/v1',
			'/options/preview',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'preview_options' ),
					'permission_callback' => array( $this, 'can_update_options' ),
				),
			)
		);
	}

	/**
	 * Check if the current user can update options
	 *
	 * @return bool
	 */
	public function can_update_options() {
		$show_global_setting = get_option( Settings::OPTION_PREFIX . 'show_global_setting', Settings::OPTIONS['show_global_setting']['default'] );

		if ( $show_global_setting ) {
			return current_user_can( 'edit_posts' );
		}

		return current_user_can( 'manage_options' );
	}

	/**
	 * Get options
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_options() {
		$options              = Settings::get_options();
		$options['block_css'] = Helper::minify_css( Helper::get_block_css() );
		return rest_ensure_response( $options );
	}

	/**
	 * Update options
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_options( $request ) {
		$params = $request->get_json_params();

		// Sanitize option values.
		foreach ( $params as $key => $value ) {
			if ( ! array_key_exists( $key, Settings::OPTIONS ) ) {
				continue;
			}

			if ( 'boolean' === Settings::OPTIONS[ $key ]['type'] ) {
				$value = $value ? 1 : 0;
			}

			if ( 'array' === Settings::OPTIONS[ $key ]['type'] ) {
				if ( ! is_array( $value ) ) {
					continue;
				}

				$value = self::filter_array_option( $key, $value );
			}

			if ( isset( Settings::OPTIONS[ $key ]['range'] ) ) {
				$min   = Settings::OPTIONS[ $key ]['range']['min'];
				$max   = Settings::OPTIONS[ $key ]['range']['max'];
				$value = min( max( (int) $value, $min ), $max );
			}

			update_option( Settings::OPTION_PREFIX . $key, $value );
		}

		return rest_ensure_response(
			array(
				'status'    => 'success',
				'message'   => __( 'Global setting saved.', 'flexible-table-block' ),
				'block_css' => Helper::minify_css( Helper::get_block_css() ),
			)
		);
	}

	/**
	 * Get the block CSS for unsaved options without saving them
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function preview_options( $request ) {
		$params      = $request->get_json_params();
		$block_style = is_array( $params ) && isset( $params['block_style'] ) && is_array( $params['block_style'] )
			? self::filter_array_option( 'block_style', $params['block_style'] )
			: array();

		return rest_ensure_response(
			array(
				'block_css' => Helper::minify_css( Helper::get_block_css( $block_style ) ),
			)
		);
	}

	/**
	 * Keep only known keys of an array option
	 *
	 * Values are validated at output time.
	 *
	 * @param string $key   Option key.
	 * @param array  $value Option value.
	 * @return array
	 */
	private static function filter_array_option( $key, $value ) {
		$default   = Settings::OPTIONS[ $key ]['default'];
		$new_value = array();

		foreach ( $value as $array_key => $array_value ) {
			if ( ! array_key_exists( $array_key, $default ) ) {
				continue;
			}

			if ( is_array( $array_value ) ) {
				// Nested values such as cell_padding.
				$sub_default = is_array( $default[ $array_key ] ) ? $default[ $array_key ] : array();
				$sub_value   = array();
				foreach ( $array_value as $sub_key => $sub_item ) {
					if ( array_key_exists( $sub_key, $sub_default ) ) {
						$sub_value[ $sub_key ] = $sub_item;
					}
				}
				$new_value[ $array_key ] = $sub_value;
			} else {
				$new_value[ $array_key ] = $array_value;
			}
		}

		return $new_value;
	}

	/**
	 * Delete options
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_options() {
		foreach ( Settings::OPTIONS as $key => $value ) {
			delete_option( Settings::OPTION_PREFIX . $key );
		}

		return rest_ensure_response(
			array(
				'options'   => Settings::get_options(),
				'status'    => 'success',
				'message'   => __( 'Global setting restored.', 'flexible-table-block' ),
				'block_css' => Helper::minify_css( Helper::get_block_css() ),
			)
		);
	}
}
