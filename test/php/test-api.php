<?php
/**
 * @package Flexible_Table_Block
 */

use Flexible_Table_Block\Settings;

/**
 * Tests for the REST API.
 */
class Test_Api extends WP_UnitTestCase {

	const ROUTE = '/flexible-table-block/v1/options';

	/**
	 * User IDs keyed by role.
	 *
	 * @var int[]
	 */
	protected static $users = array();

	/**
	 * Creates users shared by all tests.
	 *
	 * @param WP_UnitTest_Factory $factory Factory instance.
	 */
	public static function wpSetUpBeforeClass( $factory ) {
		foreach ( array( 'administrator', 'editor', 'subscriber' ) as $role ) {
			self::$users[ $role ] = $factory->user->create( array( 'role' => $role ) );
		}
	}

	/**
	 * Sends a request to the options endpoint.
	 *
	 * @param string     $method HTTP method.
	 * @param array|null $params JSON body parameters.
	 * @return WP_REST_Response
	 */
	private function request( $method, $params = null ) {
		$request = new WP_REST_Request( $method, self::ROUTE );

		if ( null !== $params ) {
			$request->set_header( 'Content-Type', 'application/json' );
			$request->set_body( wp_json_encode( $params ) );
		}

		return rest_get_server()->dispatch( $request );
	}

	/**
	 * Tests that the route is registered with GET, POST and DELETE methods.
	 */
	public function test_route_is_registered() {
		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( self::ROUTE, $routes );

		$methods = array();
		foreach ( $routes[ self::ROUTE ] as $endpoint ) {
			$methods = array_merge( $methods, array_keys( $endpoint['methods'] ) );
		}

		$this->assertEqualsCanonicalizing( array( 'GET', 'POST', 'DELETE' ), $methods );
	}

	/**
	 * Tests the permission of each method.
	 *
	 * @dataProvider data_permissions
	 *
	 * @param string      $method              HTTP method.
	 * @param bool        $show_global_setting Value of the show_global_setting option.
	 * @param string|null $role                User role, or null for logged out users.
	 * @param int         $expected_status     Expected HTTP status code.
	 */
	public function test_permissions( $method, $show_global_setting, $role, $expected_status ) {
		update_option( Settings::OPTION_PREFIX . 'show_global_setting', $show_global_setting ? 1 : 0 );
		wp_set_current_user( $role ? self::$users[ $role ] : 0 );

		$params   = 'POST' === $method ? array() : null;
		$response = $this->request( $method, $params );

		$this->assertSame( $expected_status, $response->get_status() );
	}

	/**
	 * Data provider for test_permissions().
	 *
	 * @return array[]
	 */
	public function data_permissions() {
		return array(
			'GET: logged out'                            => array( 'GET', false, null, 401 ),
			'GET: subscriber'                            => array( 'GET', false, 'subscriber', 403 ),
			'GET: editor'                                => array( 'GET', false, 'editor', 200 ),
			'GET: administrator'                         => array( 'GET', false, 'administrator', 200 ),
			'POST: logged out'                           => array( 'POST', true, null, 401 ),
			'POST: subscriber, global setting shown'     => array( 'POST', true, 'subscriber', 403 ),
			'POST: editor, global setting shown'         => array( 'POST', true, 'editor', 200 ),
			'POST: editor, global setting hidden'        => array( 'POST', false, 'editor', 403 ),
			'POST: administrator, global setting hidden' => array( 'POST', false, 'administrator', 200 ),
			'DELETE: logged out'                         => array( 'DELETE', false, null, 401 ),
			'DELETE: editor, global setting shown'       => array( 'DELETE', true, 'editor', 403 ),
			'DELETE: administrator'                      => array( 'DELETE', false, 'administrator', 200 ),
		);
	}

	/**
	 * Tests that GET returns all options with their defaults and the block CSS.
	 */
	public function test_get_options_returns_defaults() {
		wp_set_current_user( self::$users['editor'] );

		$data = $this->request( 'GET' )->get_data();

		foreach ( Settings::OPTIONS as $key => $option ) {
			$this->assertArrayHasKey( $key, $data );
			$this->assertSame( $option['default'], $data[ $key ] );
		}

		$this->assertArrayHasKey( 'block_css', $data );
		$this->assertStringContainsString( '.' . FTB_BLOCK_CLASS, $data['block_css'] );
	}

	/**
	 * Tests that POST returns a success response with the block CSS.
	 */
	public function test_update_options_response() {
		wp_set_current_user( self::$users['administrator'] );

		$data = $this->request( 'POST', array( 'tab_move' => true ) )->get_data();

		$this->assertSame( 'success', $data['status'] );
		$this->assertArrayHasKey( 'message', $data );
		$this->assertArrayHasKey( 'block_css', $data );
	}

	/**
	 * Tests that unknown keys are not saved.
	 */
	public function test_update_options_drops_unknown_keys() {
		wp_set_current_user( self::$users['administrator'] );

		$this->request(
			'POST',
			array(
				'unknown_key' => 'value',
				'tab_move'    => true,
			)
		);

		$this->assertFalse( get_option( 'flexible_table_block_unknown_key' ) );
		$this->assertFalse( get_option( 'unknown_key' ) );
		$this->assertSame( 1, (int) get_option( Settings::OPTION_PREFIX . 'tab_move' ) );
	}

	/**
	 * Tests that boolean options are coerced to 1 or 0.
	 *
	 * @dataProvider data_update_options_coerces_booleans
	 *
	 * @param mixed $value    Input value.
	 * @param int   $expected Expected stored value.
	 */
	public function test_update_options_coerces_booleans( $value, $expected ) {
		wp_set_current_user( self::$users['administrator'] );

		$this->request( 'POST', array( 'show_dot_on_th' => $value ) );

		$this->assertSame( $expected, (int) get_option( Settings::OPTION_PREFIX . 'show_dot_on_th' ) );
	}

	/**
	 * Data provider for test_update_options_coerces_booleans().
	 *
	 * @return array[]
	 */
	public function data_update_options_coerces_booleans() {
		return array(
			'true'         => array( true, 1 ),
			'false'        => array( false, 0 ),
			'integer 1'    => array( 1, 1 ),
			'integer 0'    => array( 0, 0 ),
			'empty string' => array( '', 0 ),
			'string'       => array( 'yes', 1 ),
			'null'         => array( null, 0 ),
		);
	}

	/**
	 * Tests that the breakpoint is cast to an integer and clamped to its range.
	 *
	 * @dataProvider data_update_options_clamps_breakpoint
	 *
	 * @param mixed $value    Input value.
	 * @param int   $expected Expected stored value.
	 */
	public function test_update_options_clamps_breakpoint( $value, $expected ) {
		wp_set_current_user( self::$users['administrator'] );

		$this->request( 'POST', array( 'breakpoint' => $value ) );

		$this->assertSame( $expected, (int) get_option( Settings::OPTION_PREFIX . 'breakpoint' ) );
	}

	/**
	 * Data provider for test_update_options_clamps_breakpoint().
	 *
	 * @return array[]
	 */
	public function data_update_options_clamps_breakpoint() {
		return array(
			'in range'       => array( 600, 600 ),
			'minimum'        => array( 200, 200 ),
			'maximum'        => array( 1200, 1200 ),
			'below minimum'  => array( 100, 200 ),
			'negative'       => array( -500, 200 ),
			'above maximum'  => array( 5000, 1200 ),
			'numeric string' => array( '900', 900 ),
			'float'          => array( 700.9, 700 ),
			'invalid string' => array( 'abc', 200 ),
			'string with px' => array( '1000px', 1000 ),
		);
	}

	/**
	 * Tests that unknown keys in array options are dropped, including nested arrays.
	 */
	public function test_update_options_filters_array_keys() {
		wp_set_current_user( self::$users['administrator'] );

		$this->request(
			'POST',
			array(
				'block_style' => array(
					'table_width'       => '80%',
					'unknown_style'     => 'value',
					'cell_border_color' => '#ff0000',
					'cell_padding'      => array(
						'top'     => '1em',
						'left'    => '2em',
						'unknown' => '3em',
					),
				),
			)
		);

		$this->assertSame(
			array(
				'table_width'       => '80%',
				'cell_border_color' => '#ff0000',
				'cell_padding'      => array(
					'top'  => '1em',
					'left' => '2em',
				),
			),
			get_option( Settings::OPTION_PREFIX . 'block_style' )
		);
	}

	/**
	 * Tests that a nested array is dropped for a key whose default is not an array.
	 */
	public function test_update_options_drops_nested_values_for_scalar_keys() {
		wp_set_current_user( self::$users['administrator'] );

		$this->request(
			'POST',
			array(
				'block_style' => array(
					'table_width' => array( 'top' => '1em' ),
				),
			)
		);

		$this->assertSame(
			array( 'table_width' => array() ),
			get_option( Settings::OPTION_PREFIX . 'block_style' )
		);
	}

	/**
	 * Tests that a non-array value for an array option is ignored.
	 *
	 * @dataProvider data_update_options_ignores_invalid_array_types
	 *
	 * @param mixed $value Input value.
	 */
	public function test_update_options_ignores_invalid_array_types( $value ) {
		$stored = array( 'table_width' => '50%' );
		update_option( Settings::OPTION_PREFIX . 'block_style', $stored );
		wp_set_current_user( self::$users['administrator'] );

		$this->request( 'POST', array( 'block_style' => $value ) );

		$this->assertSame( $stored, get_option( Settings::OPTION_PREFIX . 'block_style' ) );
	}

	/**
	 * Data provider for test_update_options_ignores_invalid_array_types().
	 *
	 * @return array[]
	 */
	public function data_update_options_ignores_invalid_array_types() {
		return array(
			'string'  => array( 'table_width: 100%' ),
			'integer' => array( 100 ),
			'boolean' => array( true ),
			'null'    => array( null ),
		);
	}

	/**
	 * Tests that DELETE removes all options and returns the defaults.
	 */
	public function test_delete_options_restores_defaults() {
		update_option( Settings::OPTION_PREFIX . 'tab_move', 1 );
		update_option( Settings::OPTION_PREFIX . 'breakpoint', 1000 );
		update_option( Settings::OPTION_PREFIX . 'block_style', array( 'table_width' => '50%' ) );
		wp_set_current_user( self::$users['administrator'] );

		$data = $this->request( 'DELETE' )->get_data();

		foreach ( array_keys( Settings::OPTIONS ) as $key ) {
			$option_name = Settings::OPTION_PREFIX . $key;
			$this->assertFalse( get_option( $option_name ), "{$option_name} should be deleted." );
		}

		$this->assertSame( 'success', $data['status'] );
		$this->assertArrayHasKey( 'block_css', $data );

		foreach ( Settings::OPTIONS as $key => $option ) {
			$this->assertSame( $option['default'], $data['options'][ $key ] );
		}
	}
}
