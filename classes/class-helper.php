<?php
/**
 * @package Flexible_Table_Block;
 * @author Aki Hamano
 * @license GPL-2.0+
 */

namespace Flexible_Table_Block;

class Helper {

	/**
	 * Get default block style
	 *
	 * @return string
	 */
	public static function get_block_css( $prefix = '' ) {
		$selector = "{$prefix}." . FTB_BLOCK_CLASS;

		// CSS selectors.
		$styles = array(
			"{$selector} > table"       => '',
			"{$selector}.is-style-stripes tbody tr:nth-child(odd) th" => '',
			"{$selector}.is-style-stripes tbody tr:nth-child(odd) td" => '',
			"{$selector}.is-style-stripes tbody tr:nth-child(even) th" => '',
			"{$selector}.is-style-stripes tbody tr:nth-child(even) td" => '',
			"{$selector} > table tr th, {$selector} > table tr td" => '',
			"{$selector} > table tr th" => '',
			"{$selector} > table tr td" => '',
			"{$selector} > table tr th, {$selector} table > tr td" => '',
		);

		$option = get_option( Option::OPTION_NAMES['block_style'], Settings::OPTIONS['block_style']['default'] );

		// Genelate styles based on Global setting.
		foreach ( $option as $key => $value ) {
			if ( '' === $value || null === $value ) {
				continue;
			}

			switch ( $key ) {
				case 'table_width':
					$styles[ "{$selector} > table" ] .= self::sanitize_css_declaration( 'width', $value );
					break;
				case 'table_max_width':
					$styles[ "{$selector} > table" ] .= self::sanitize_css_declaration( 'max-width', $value );
					break;
				case 'table_border_collapse':
					$styles[ "{$selector} > table" ] .= self::sanitize_css_declaration( 'border-collapse', $value );
					break;
				case 'row_odd_color':
					$styles[ "{$selector}.is-style-stripes tbody tr:nth-child(odd) th" ] .= self::sanitize_css_declaration( 'background-color', $value );
					$styles[ "{$selector}.is-style-stripes tbody tr:nth-child(odd) td" ] .= self::sanitize_css_declaration( 'background-color', $value );
					break;
				case 'row_even_color':
					$styles[ "{$selector}.is-style-stripes tbody tr:nth-child(even) th" ] .= self::sanitize_css_declaration( 'background-color', $value );
					$styles[ "{$selector}.is-style-stripes tbody tr:nth-child(even) td" ] .= self::sanitize_css_declaration( 'background-color', $value );
					break;
				case 'cell_text_align':
					$styles[ "{$selector} > table tr th, {$selector} > table tr td" ] .= self::sanitize_css_declaration( 'text-align', $value );
					break;
				case 'cell_vertical_align':
					$styles[ "{$selector} > table tr th, {$selector} > table tr td" ] .= self::sanitize_css_declaration( 'vertical-align', $value );
					break;
				case 'cell_text_color_th':
					$styles[ "{$selector} > table tr th" ] .= self::sanitize_css_declaration( 'color', $value );
					break;
				case 'cell_text_color_td':
					$styles[ "{$selector} > table tr td" ] .= self::sanitize_css_declaration( 'color', $value );
					break;
				case 'cell_background_color_th':
					$styles[ "{$selector} > table tr th" ] .= self::sanitize_css_declaration( 'background-color', $value );
					break;
				case 'cell_background_color_td':
					$styles[ "{$selector} > table tr td" ] .= self::sanitize_css_declaration( 'background-color', $value );
					break;
				case 'cell_padding':
					$padding_styles = self::get_padding_styles( $value );
					if ( $padding_styles ) {
						$styles[ "{$selector} > table tr th, {$selector} > table tr td" ] .= $padding_styles;
					}
					break;
				case 'cell_border_width':
					$styles[ "{$selector} > table tr th, {$selector} > table tr td" ] .= self::sanitize_css_declaration( 'border-width', $value );
					break;
				case 'cell_border_style':
					$styles[ "{$selector} > table tr th, {$selector} > table tr td" ] .= self::sanitize_css_declaration( 'border-style', $value );
					break;
				case 'cell_border_color':
					$styles[ "{$selector} > table tr th, {$selector} > table tr td" ] .= self::sanitize_css_declaration( 'border-color', $value );
					break;
			}
		}

		$css = '';

		foreach ( $styles as $selector => $values ) {
			if ( $values ) {
				$css .= "{$selector} { $values }";
			}
		}

		return $css;
	}

	/**
	 * Get responsive style with dynamic breakpoints
	 *
	 * @return string
	 */
	public static function get_responsive_css( $prefix = '' ) {
		$selector   = "{$prefix}." . FTB_BLOCK_CLASS;
		$breakpoint = get_option( Option::OPTION_NAMES['breakpoint'], Settings::OPTIONS['breakpoint']['default'] );
		$max_width  = $breakpoint;
		$min_width  = $max_width + 1;

		return <<<EOM
		@media screen and (min-width:{$min_width}px) {
			{$selector}.is-scroll-on-pc {
				overflow-x: scroll;
			}
			{$selector}.is-scroll-on-pc table {
				max-width: none;
				align-self: self-start;
			}
		}
		@media screen and (max-width:{$max_width}px) {
			{$selector}.is-scroll-on-mobile {
				overflow-x: scroll;
			}
			{$selector}.is-scroll-on-mobile table {
				max-width: none;
				align-self: self-start;
			}
			{$selector} table.is-stacked-on-mobile th,
			{$selector} table.is-stacked-on-mobile td {
				width: 100%!important;
				display: block;
			}
		}
		EOM;
	}

	/**
	 * Build a safe `property:value;` CSS declaration from an untrusted value.
	 *
	 * @param string $property CSS property name.
	 * @param mixed  $value    CSS value.
	 * @return string Declaration ending with `;`, or empty string if rejected.
	 */
	public static function sanitize_css_declaration( $property, $value ) {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return '';
		}

		// safecss_filter_attr() does not remove these; reject to stay inside the
		// surrounding <style> element.
		if ( false !== strpos( $value, '<' ) || false !== strpos( $value, '>' ) ) {
			return '';
		}

		add_filter( 'safecss_filter_attr_allow_css', array( __CLASS__, 'allow_color_functions' ), 10, 2 );
		$filtered = safecss_filter_attr( "{$property}: {$value}" );
		remove_filter( 'safecss_filter_attr_allow_css', array( __CLASS__, 'allow_color_functions' ), 10 );

		// Dropped entirely when the property is not allow-listed or the value is
		// considered unsafe.
		if ( '' === $filtered ) {
			return '';
		}

		return $filtered . ';';
	}

	/**
	 * Re-allow CSS color functions in safecss_filter_attr().
	 *
	 * @param bool   $allow_css       Default decision from core.
	 * @param string $css_test_string Normalized value under test.
	 * @return bool Whether the value is safe.
	 */
	public static function allow_color_functions( $allow_css, $css_test_string ) {
		if ( $allow_css ) {
			return $allow_css;
		}

		$stripped = preg_replace(
			'/\b(?:rgba|rgb|hsla|hsl|hwb|oklab|oklch|lab|lch|color-mix|color)(\((?:[^()]|(?1))*\))/i',
			'',
			$css_test_string
		);

		if ( ! is_string( $stripped ) ) {
			return $allow_css;
		}

		// Allow only when no dangerous chars (`\ ( & = }`) or comments remain,
		// the same check core uses in safecss_filter_attr().
		return ! preg_match( '%[\\\(&=}]|/\*%', $stripped );
	}

	/**
	 * Minify CSS
	 *
	 * @return string
	 */
	public static function minify_css( $css ) {
		$replaces = array();

    // phpcs:disable Generic.Formatting.MultipleStatementAlignment
		$replaces['/@charset [^;]+;/'] = '';
		$replaces['/([\s:]url\()[\"\']([^\"\']+)[\"\'](\)[\s;}])/'] = '${1}${2}${3}';
		$replaces['/(\/\*(?=[!]).*?\*\/|\"(?:(?!(?<!\\\)\").)*\"|\'(?:(?!(?<!\\\)\').)*\')|\s+/'] = '${1} ';
		$replaces['/(\/\*(?=[!]).*?\*\/|\"(?:(?!(?<!\\\)\").)*\"|\'(?:(?!(?<!\\\)\').)*\')|\/\*.*?\*\/|\s+([:])\s+|\s+([)])|([(:])\s+/s'] = '${1}${2}${3}${4}';
		$replaces['/\s*(\/\*(?=[!]).*?\*\/|\"(?:(?!(?<!\\\)\").)*\"|\'(?:(?!(?<!\\\)\').)*\'|[ :]calc\([^;}]+\)[ ;}]|[!$&+,\/;<=>?@^_{|}~]|\A|\z)\s*/s'] = '${1}';
    // phpcs:enable

		$css = preg_replace( array_keys( $replaces ), array_values( $replaces ), $css );
		return $css;
	}

	/**
	 * Get padding styles from string value or array values
	 *
	 * @return string
	 */
	public static function get_padding_styles( $values ) {
		if ( is_string( $values ) ) {
			$declaration = self::sanitize_css_declaration( 'padding', $values );
			return '' === $declaration ? null : $declaration;
		}

		if ( ! is_array( $values ) ) {
			return null;
		}

		$default_values = array(
			'top'    => '',
			'right'  => '',
			'bottom' => '',
			'left'   => '',
		);
		$values         = array_merge( $default_values, $values );

		if ( '' !== $values['top'] && '' !== $values['right'] && '' !== $values['bottom'] && '' !== $values['left'] ) {
			$padding_value = self::get_shorhand_css_value( $values['top'], $values['right'], $values['bottom'], $values['left'] );
			$declaration   = self::sanitize_css_declaration( 'padding', $padding_value );
			return '' === $declaration ? null : $declaration;
		}

		$styles = null;

		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			if ( '' === $values[ $side ] ) {
				continue;
			}
			$styles .= self::sanitize_css_declaration( "padding-{$side}", $values[ $side ] );
		}

		return $styles;
	}

	/**
	 * Get CSS value in consideration of short-hand from four values
	 *
	 * @return string
	 */
	public static function get_shorhand_css_value( $top, $right, $bottom, $left ) {
		if ( $top === $right && $top === $bottom && $top === $left ) {
			return $top;
		}

		if ( $top === $bottom && $left === $right ) {
			return "{$top} {$left}";
		}

		if ( $left === $right ) {
			return "{$top} {$left} {$bottom}";
		}

		return "{$top} {$right} {$bottom} {$left}";
	}
}
