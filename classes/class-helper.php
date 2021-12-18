<?php
/**
 * @package Flexible_Table_Block;
 * @author Tetsuaki Hamano
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
		$selector = "${prefix}." . FTB_BLOCK_CLASS;

		// CSS selectors.
		$styles = array(
			"${selector} > table"       => '',
			"${selector}.is-style-stripes tr:nth-child(odd) th" => '',
			"${selector}.is-style-stripes tr:nth-child(odd) td" => '',
			"${selector}.is-style-stripes tr:nth-child(even) th" => '',
			"${selector}.is-style-stripes tr:nth-child(even) td" => '',
			"${selector} > table tr th, ${selector} > table tr td" => '',
			"${selector} > table tr th" => '',
			"${selector} > table tr td" => '',
			"${selector} > table tr th, ${selector} table > tr td" => '',
		);

		$option = get_option( FTB_OPTION_PREFIX . '_block_style', Settings::OPTIONS['block_style']['default'] );

		// Genelate styles based on global setting.
		foreach ( $option as $key => $value ) {

			if ( ! $value ) {
				continue;
			}

			$value = esc_attr( $value );

			switch ( $key ) {
				case 'table_width':
					$styles[ "${selector} > table" ] .= "width:${value};";
					break;
				case 'table_max_width':
					$styles[ "${selector} > table" ] .= "max-width:${value};";
					break;
				case 'table_border_collapse':
					$styles[ "${selector} > table" ] .= "border-collapse:${value};";
					break;
				case 'row_odd_color':
					$styles[ "${selector}.is-style-stripes tr:nth-child(odd) th" ] .= "background-color:${value};";
					$styles[ "${selector}.is-style-stripes tr:nth-child(odd) td" ] .= "background-color:${value};";
					break;
				case 'row_even_color':
					$styles[ "${selector}.is-style-stripes tr:nth-child(even) th" ] .= "background-color:${value};";
					$styles[ "${selector}.is-style-stripes tr:nth-child(even) td" ] .= "background-color:${value};";
					break;
				case 'cell_text_align':
					$styles[ "${selector} > table tr th, ${selector} > table tr td" ] .= "text-align:${value};";
					break;
				case 'cell_vertical_align':
					$styles[ "${selector} > table tr th, ${selector} > table tr td" ] .= "vertical-align:${value};";
					break;
				case 'cell_text_color_th':
					$styles[ "${selector} > table tr th" ] .= "color:${value};";
					break;
				case 'cell_text_color_td':
					$styles[ "${selector} > table tr td" ] .= "color:${value};";
					break;
				case 'cell_background_color_th':
					$styles[ "${selector} > table tr th" ] .= "background-color:${value};";
					break;
				case 'cell_background_color_td':
					$styles[ "${selector} > table tr td" ] .= "background-color:${value};";
					break;
				case 'cell_padding':
					$styles[ "${selector} > table tr th, ${selector} > table tr td" ] .= "padding:${value};";
					break;
				case 'cell_border_width':
					$styles[ "${selector} > table tr th, ${selector} > table tr td" ] .= "border-width:${value};";
					break;
				case 'cell_border_style':
					$styles[ "${selector} > table tr th, ${selector} > table tr td" ] .= "border-style:${value};";
					break;
				case 'cell_border_color':
					$styles[ "${selector} > table tr th, ${selector} > table tr td" ] .= "border-color:${value};";
					break;
			}
		}

		$css = '';

		foreach ( $styles as $selector => $values ) {
			if ( $values ) {
				$css .= "${selector} { $values }";
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
		$selector   = "${prefix}." . FTB_BLOCK_CLASS;
		$breakpoint = get_option( FTB_OPTION_PREFIX . '_breakpoint', Settings::OPTIONS['breakpoint']['default'] );
		$max_width  = $breakpoint;
		$min_width  = $max_width + 1;

		return <<<EOM
		@media screen and (min-width:{$min_width}px) {
			${selector}.is-scroll-on-pc {
				overflow-x: scroll;
			}
			${selector}.is-scroll-on-pc table {
				max-width: none;
			}
		}
		@media screen and (max-width:{$max_width}px) {
			${selector}.is-scroll-on-mobile {
				overflow-x: scroll;
			}
			${selector}.is-scroll-on-mobile table {
				max-width: none;
			}
			${selector} table.is-stacked-on-mobile th,
			${selector} table.is-stacked-on-mobile td {
				width: 100%!important;
				display: block;
			}
		}
		EOM;
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
}
