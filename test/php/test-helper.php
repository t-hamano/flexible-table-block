<?php
/**
 * @package Flexible_Table_Block
 */

use Flexible_Table_Block\Helper;
use Flexible_Table_Block\Settings;

/**
 * Tests for the Helper class.
 */
class Test_Helper extends WP_UnitTestCase {

	/**
	 * Tests that unsafe or unsupported CSS declarations are rejected.
	 *
	 * @dataProvider data_sanitize_css_declaration_rejects
	 *
	 * @param string $property CSS property name.
	 * @param mixed  $value    CSS property value.
	 */
	public function test_sanitize_css_declaration_rejects( $property, $value ) {
		$this->assertSame( '', Helper::sanitize_css_declaration( $property, $value ) );
	}

	/**
	 * Data provider for test_sanitize_css_declaration_rejects().
	 *
	 * @return array[]
	 */
	public function data_sanitize_css_declaration_rejects() {
		return array(
			'null'                   => array( 'color', null ),
			'array'                  => array( 'color', array( 'red' ) ),
			'number'                 => array( 'width', 100 ),
			'empty string'           => array( 'color', '' ),
			'whitespace only'        => array( 'color', '   ' ),
			'less-than sign'         => array( 'color', 'red<' ),
			'greater-than sign'      => array( 'color', 'red>' ),
			'closing style tag'      => array( 'color', 'red</style><script>alert(1)</script>' ),
			'disallowed property'    => array( 'behavior', 'url(x.htc)' ),
			'unknown property'       => array( 'foo', 'bar' ),
			'expression()'           => array( 'width', 'expression(alert(1))' ),
			'url() in color'         => array( 'color', 'url(javascript:alert(1))' ),
			'backslash'              => array( 'color', 're\\64' ),
			'comment'                => array( 'color', 'red/**/' ),
			'closing brace'          => array( 'color', 'red}' ),
			'unknown function'       => array( 'color', 'foo(0 0 0)' ),
			'unsafe color function'  => array( 'color', 'rgb(0 0 0) url(x)' ),
			'comment after function' => array( 'color', 'rgb(0 0 0)/**/' ),
		);
	}

	/**
	 * Tests that valid CSS declarations are kept.
	 *
	 * @dataProvider data_sanitize_css_declaration_allows
	 *
	 * @param string $property CSS property name.
	 * @param string $value    CSS property value.
	 * @param string $expected Expected CSS declaration.
	 */
	public function test_sanitize_css_declaration_allows( $property, $value, $expected ) {
		$this->assertSame( $expected, Helper::sanitize_css_declaration( $property, $value ) );
	}

	/**
	 * Data provider for test_sanitize_css_declaration_allows().
	 *
	 * @return array[]
	 */
	public function data_sanitize_css_declaration_allows() {
		return array(
			'keyword'      => array( 'border-collapse', 'collapse', 'border-collapse: collapse;' ),
			'hex color'    => array( 'color', '#ffffff', 'color: #ffffff;' ),
			'length'       => array( 'width', '100%', 'width: 100%;' ),
			'calc()'       => array( 'width', 'calc(100% - 1em)', 'width: calc(100% - 1em);' ),
			'var()'        => array( 'color', 'var(--wp--preset--color--primary)', 'color: var(--wp--preset--color--primary);' ),
			'rgb()'        => array( 'color', 'rgb(0 0 0)', 'color: rgb(0 0 0);' ),
			'rgba()'       => array( 'color', 'rgba(0, 0, 0, 0.5)', 'color: rgba(0, 0, 0, 0.5);' ),
			'hsl()'        => array( 'color', 'hsl(120deg 50% 50%)', 'color: hsl(120deg 50% 50%);' ),
			'hsla()'       => array( 'color', 'hsla(120, 50%, 50%, 0.5)', 'color: hsla(120, 50%, 50%, 0.5);' ),
			'hwb()'        => array( 'color', 'hwb(120 10% 20%)', 'color: hwb(120 10% 20%);' ),
			'lab()'        => array( 'color', 'lab(50% 40 59.5)', 'color: lab(50% 40 59.5);' ),
			'lch()'        => array( 'color', 'lch(52% 72 50)', 'color: lch(52% 72 50);' ),
			'oklab()'      => array( 'color', 'oklab(0.6 0.1 0.1)', 'color: oklab(0.6 0.1 0.1);' ),
			'oklch()'      => array( 'color', 'oklch(70% 0.1 200)', 'color: oklch(70% 0.1 200);' ),
			'color()'      => array( 'color', 'color(display-p3 1 0 0)', 'color: color(display-p3 1 0 0);' ),
			'color-mix()'  => array( 'color', 'color-mix(in srgb, red 50%, blue)', 'color: color-mix(in srgb, red 50%, blue);' ),
			'nested'       => array( 'background-color', 'color-mix(in oklch, rgb(0 0 0) 50%, white)', 'background-color: color-mix(in oklch, rgb(0 0 0) 50%, white);' ),
			'uppercase'    => array( 'color', 'RGB(0 0 0)', 'color: RGB(0 0 0);' ),
			'border-color' => array( 'border-color', 'rgb(0 0 0) oklch(70% 0.1 200)', 'border-color: rgb(0 0 0) oklch(70% 0.1 200);' ),
		);
	}

	/**
	 * Tests that the temporary color function filter is removed after sanitizing.
	 */
	public function test_sanitize_css_declaration_removes_filter() {
		Helper::sanitize_css_declaration( 'color', 'rgb(0 0 0)' );

		$this->assertFalse( has_filter( 'safecss_filter_attr_allow_css', array( Helper::class, 'allow_color_functions' ) ) );
		$this->assertSame( '', safecss_filter_attr( 'color: rgb(0 0 0)' ) );
	}

	/**
	 * Tests that a value already allowed by core stays allowed.
	 */
	public function test_allow_color_functions_keeps_core_decision() {
		$this->assertTrue( Helper::allow_color_functions( true, 'url(x)' ) );
	}

	/**
	 * Tests whether CSS color functions are allowed.
	 *
	 * @dataProvider data_allow_color_functions
	 *
	 * @param string $css_test_string CSS string tested by core.
	 * @param bool   $expected        Whether the string should be allowed.
	 */
	public function test_allow_color_functions( $css_test_string, $expected ) {
		$this->assertSame( $expected, Helper::allow_color_functions( false, $css_test_string ) );
	}

	/**
	 * Data provider for test_allow_color_functions().
	 *
	 * @return array[]
	 */
	public function data_allow_color_functions() {
		return array(
			'rgb()'                  => array( 'color:rgb(0 0 0)', true ),
			'nested'                 => array( 'color:color-mix(in srgb, rgb(0 0 0), white)', true ),
			'unknown function'       => array( 'color:foo(0 0 0)', false ),
			'expression()'           => array( 'width:expression(alert(1))', false ),
			'unbalanced parenthesis' => array( 'color:rgb(0 0 0', false ),
			'backslash'              => array( 'color:rgb(0 0 0)\\', false ),
			'ampersand'              => array( 'color:rgb(0 0 0)&', false ),
			'equals sign'            => array( 'color:rgb(0 0 0)=', false ),
			'closing brace'          => array( 'color:rgb(0 0 0)}', false ),
			'comment'                => array( 'color:rgb(0 0 0)/*', false ),
		);
	}

	/**
	 * Tests that four side values are combined into a shorthand value.
	 *
	 * @dataProvider data_get_shorthand_css_value
	 *
	 * @param string[] $values   Top, right, bottom and left values.
	 * @param string   $expected Expected shorthand value.
	 */
	public function test_get_shorthand_css_value( $values, $expected ) {
		$this->assertSame( $expected, Helper::get_shorthand_css_value( ...$values ) );
	}

	/**
	 * Data provider for test_get_shorthand_css_value().
	 *
	 * @return array[]
	 */
	public function data_get_shorthand_css_value() {
		return array(
			'all equal'               => array( array( '1px', '1px', '1px', '1px' ), '1px' ),
			'vertical and horizontal' => array( array( '1px', '2px', '1px', '2px' ), '1px 2px' ),
			'top, horizontal, bottom' => array( array( '1px', '2px', '3px', '2px' ), '1px 2px 3px' ),
			'all different'           => array( array( '1px', '2px', '3px', '4px' ), '1px 2px 3px 4px' ),
			'top equals bottom only'  => array( array( '1px', '2px', '1px', '4px' ), '1px 2px 1px 4px' ),
		);
	}

	/**
	 * Tests the generated padding declarations.
	 *
	 * @dataProvider data_get_padding_styles
	 *
	 * @param mixed       $values   Padding value or values for each side.
	 * @param string|null $expected Expected padding declarations.
	 */
	public function test_get_padding_styles( $values, $expected ) {
		$this->assertSame( $expected, Helper::get_padding_styles( $values ) );
	}

	/**
	 * Data provider for test_get_padding_styles().
	 *
	 * @return array[]
	 */
	public function data_get_padding_styles() {
		return array(
			'string'              => array( '1em', 'padding: 1em;' ),
			'unsafe string'       => array( '1em</style>', null ),
			'null'                => array( null, null ),
			'number'              => array( 10, null ),
			'empty array'         => array( array(), null ),
			'all sides equal'     => array(
				array(
					'top'    => '1em',
					'right'  => '1em',
					'bottom' => '1em',
					'left'   => '1em',
				),
				'padding: 1em;',
			),
			'all sides different' => array(
				array(
					'top'    => '1px',
					'right'  => '2px',
					'bottom' => '3px',
					'left'   => '4px',
				),
				'padding: 1px 2px 3px 4px;',
			),
			'some sides'          => array(
				array(
					'top'  => '1px',
					'left' => '4px',
				),
				'padding-top: 1px;padding-left: 4px;',
			),
			'some sides empty'    => array(
				array(
					'top'    => '',
					'right'  => '2px',
					'bottom' => '',
					'left'   => '',
				),
				'padding-right: 2px;',
			),
			'unsafe all sides'    => array(
				array(
					'top'    => '1px',
					'right'  => '1px',
					'bottom' => '1px',
					'left'   => 'expression(alert(1))',
				),
				null,
			),
			'unsafe some sides'   => array(
				array(
					'top'  => '1px',
					'left' => '1px<',
				),
				'padding-top: 1px;',
			),
		);
	}

	/**
	 * Tests CSS minification.
	 *
	 * @dataProvider data_minify_css
	 *
	 * @param string $css      CSS to minify.
	 * @param string $expected Expected minified CSS.
	 */
	public function test_minify_css( $css, $expected ) {
		$this->assertSame( $expected, Helper::minify_css( $css ) );
	}

	/**
	 * Data provider for test_minify_css().
	 *
	 * @return array[]
	 */
	public function data_minify_css() {
		return array(
			'whitespace'        => array( ".a  .b {\n\tcolor : red ;\n\twidth: 100% ;\n}\n", '.a .b{color:red;width:100%;}' ),
			'comment'           => array( '.a { /* comment */ color: red; }', '.a{color:red;}' ),
			'important comment' => array( '/*! keep */ .a { color: red; }', '/*! keep */.a{color:red;}' ),
			'charset'           => array( '@charset "UTF-8"; .a { color: red; }', '.a{color:red;}' ),
			'url quotes'        => array( '.a { background: url("image.png"); }', '.a{background:url(image.png);}' ),
			'quoted string'     => array( '.a::before { content: "a  b"; }', '.a::before{content:"a  b";}' ),
			'calc() spaces'     => array( '.a { width: calc(100% - 1em); }', '.a{width:calc(100% - 1em);}' ),
			'media query'       => array( "@media screen and (max-width: 768px) {\n\t.a {\n\t\tdisplay: block;\n\t}\n}", '@media screen and (max-width:768px){.a{display:block;}}' ),
		);
	}

	/**
	 * Tests the block CSS generated from the default options.
	 */
	public function test_get_block_css_with_default_option() {
		$selector = '.wp-block-flexible-table-block-table.wp-block-flexible-table-block-table';
		$expected = "{$selector} > table { width: 100%;max-width: 100%;border-collapse: collapse; }"
			. "{$selector}.is-style-stripes tbody tr:nth-child(odd) th { background-color: #f0f0f1; }"
			. "{$selector}.is-style-stripes tbody tr:nth-child(odd) td { background-color: #f0f0f1; }"
			. "{$selector}.is-style-stripes tbody tr:nth-child(even) th { background-color: #ffffff; }"
			. "{$selector}.is-style-stripes tbody tr:nth-child(even) td { background-color: #ffffff; }"
			. "{$selector} > table tr th, {$selector} > table tr td { padding: 0.5em;border-width: 1px;border-style: solid;border-color: #000000;text-align: left;vertical-align: middle; }"
			. "{$selector} > table tr th { background-color: #f0f0f1; }"
			. "{$selector} > table tr td { background-color: #ffffff; }";

		$this->assertSame( $expected, Helper::get_block_css() );
	}

	/**
	 * Tests the block CSS generated from customized options.
	 */
	public function test_get_block_css_with_custom_option() {
		update_option(
			Settings::OPTION_PREFIX . 'block_style',
			array(
				'table_width'              => '80%',
				'row_odd_color'            => 'oklch(70% 0.1 200)',
				'cell_text_color_th'       => 'rgb(255 0 0)',
				'cell_text_color_td'       => null,
				'cell_background_color_th' => '',
				'cell_padding'             => array(
					'top'    => '1px',
					'right'  => '2px',
					'bottom' => '1px',
					'left'   => '2px',
				),
			)
		);

		$selector = '.wp-block-flexible-table-block-table.wp-block-flexible-table-block-table';
		$expected = "{$selector} > table { width: 80%; }"
			. "{$selector}.is-style-stripes tbody tr:nth-child(odd) th { background-color: oklch(70% 0.1 200); }"
			. "{$selector}.is-style-stripes tbody tr:nth-child(odd) td { background-color: oklch(70% 0.1 200); }"
			. "{$selector} > table tr th, {$selector} > table tr td { padding: 1px 2px; }"
			. "{$selector} > table tr th { color: rgb(255 0 0); }";

		$this->assertSame( $expected, Helper::get_block_css() );
	}

	/**
	 * Tests that unsafe option values are dropped from the block CSS.
	 */
	public function test_get_block_css_drops_unsafe_values() {
		update_option(
			Settings::OPTION_PREFIX . 'block_style',
			array(
				'table_width'       => '100%</style><script>alert(1)</script>',
				'table_max_width'   => 'expression(alert(1))',
				'row_even_color'    => 'url(javascript:alert(1))',
				'cell_border_color' => 'red}body{display:none',
				'cell_border_style' => 'solid',
			)
		);

		$selector = '.wp-block-flexible-table-block-table.wp-block-flexible-table-block-table';
		$expected = "{$selector} > table tr th, {$selector} > table tr td { border-style: solid; }";

		$this->assertSame( $expected, Helper::get_block_css() );
	}

	/**
	 * Tests that empty options generate no block CSS.
	 */
	public function test_get_block_css_with_empty_option() {
		update_option( Settings::OPTION_PREFIX . 'block_style', array() );

		$this->assertSame( '', Helper::get_block_css() );
	}

	/**
	 * Tests that the given option is used instead of the saved option.
	 */
	public function test_get_block_css_with_given_option() {
		update_option( Settings::OPTION_PREFIX . 'block_style', array( 'table_width' => '50%' ) );

		$selector = '.wp-block-flexible-table-block-table.wp-block-flexible-table-block-table';
		$expected = "{$selector} > table tr th { color: red; }";

		$this->assertSame( $expected, Helper::get_block_css( array( 'cell_text_color_th' => 'red' ) ) );
	}
}
