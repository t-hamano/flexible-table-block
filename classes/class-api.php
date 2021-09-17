<?php
/**
 * @package flexible-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

namespace flexible_table_block;

class Api {

	/**
	 * Constructor
	 */
	public function __construct() {
		// Register REST API route
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {

		register_rest_route(
			FTB_NAMESPACE . '/v1',
			'/get_options',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_options' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			FTB_NAMESPACE . '/v1',
			'/update_options',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_options' ),
					'permission_callback' => function () {
						$show_global_setting = get_option( FTB_OPTION_PREFIX . '_show_global_setting', Settings::OPTIONS['show_global_setting']['default'] );

						if ( $show_global_setting ) {
							return current_user_can( 'edit_posts' );
						} else {
							return current_user_can( 'administrator' );
						}
					},
				),
			)
		);

		register_rest_route(
			FTB_NAMESPACE . '/v1',
			'/delete_options',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'delete_options' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Get options.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_options() {
		error_log( print_r( wp_get_current_user()->roles, true ) );
		return rest_ensure_response( Settings::get_options() );
	}

	/**
	 * Update options.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_options( $request ) {
		$params = $request->get_json_params();

		foreach ( $params as $key => $value ) {

			if ( ! array_key_exists( $key, Settings::OPTIONS ) ) {
				continue;
			}

			if ( 'boolean' === Settings::OPTIONS[ $key ]['type'] ) {
				$value = (bool) $value;
			}

			if ( isset( Settings::OPTIONS[ $key ]['range'] ) ) {
				$min   = Settings::OPTIONS[ $key ]['range']['min'];
				$max   = Settings::OPTIONS[ $key ]['range']['max'];
				$value = min( max( $value, $min ), $max );
			}

			if ( isset( Settings::OPTIONS[ $key ]['sanitize_callback'] ) ) {
				$callback = Settings::OPTIONS[ $key ]['sanitize_callback'];
				$value    = call_user_func( array( $this, $callback ), $value );
			}

			if ( is_wp_error( $value ) ) {
				return rest_ensure_response(
					array(
						'status'  => 'error',
						'message' => $value->get_error_message(),
					)
				);
			} else {
				update_option( FTB_OPTION_PREFIX . '_' . $key, $value );
			}
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'message' => __( 'Setting saved.', 'flexible-table-block' ),
			)
		);
	}

	/**
	 * Delete options.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_options() {
		foreach ( Settings::OPTIONS as $key => $value ) {
			delete_option( FTB_OPTION_PREFIX . '_' . $key );
		}
		return rest_ensure_response(
			array(
				'options' => Settings::get_options(),
				'status'  => 'success',
				'message' => __( 'Settings have been reset.', 'flexible-table-block' ),
			)
		);
	}

	/**
	 * Validate a received value for being valid CSS.
	 *
	 * @param string $value CSS to validate.
	 * @return true|WP_Error
	 */
	public static function sanitize_css( $value ) {
		if ( preg_match( '#</?\w+#', $value ) ) {
			return new \WP_Error( 'illegal_markup', __( 'Markup is not allowed in CSS.', 'flexible-table-block' ) );
		}

		return $value;
	}
}

new Api();
