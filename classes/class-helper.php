<?php
/**
 * @package flexible-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

namespace flexible_table_block;

class Helper {
	/**
	 * Get block default style.
	 *
	 * @return string
	 */
	public static function get_block_css() {
		$block_class = FTB_BLOCK_CLASS;
		$styles      = array();
		$option      = get_option( FTB_OPTION_PREFIX . '_block_style', Settings::OPTIONS['block_style']['default'] );

		foreach ( $option as $key => $value ) {
			$value = esc_attr( $value );

			switch ( $key ) {
				case 'table_width':
					$styles[ ".${block_class} table" ] .= "width:${value};";
					break;
				case 'table_max_width':
					$styles[ ".${block_class} table" ] .= "max-width:${value};";
					break;
				case 'table_border_collapse':
					$styles[ ".${block_class} table" ] .= "border-collapse:${value};";
					break;
				case 'row_odd_color':
					$styles[ ".${block_class}.is-style-stripes tbody tr:nth-child(odd)" ] .= "background-color:${value};";
					break;
				case 'row_even_color':
					$styles[ ".${block_class}.is-style-stripes tbody tr:nth-child(even)" ] .= "background-color:${value};";
					break;
				case 'cell_text_align':
					$styles[ ".${block_class} table th, .${block_class} table td" ] .= "text-align:${value};";
					break;
				case 'cell_vertical_align':
					$styles[ ".${block_class} table th, .${block_class} table td" ] .= "vertical-align:${value};";
					break;
				case 'cell_background_color_th':
					$styles[ ".${block_class} table th" ] .= "background-color:${value};";
					break;
				case 'cell_background_color_td':
					$styles[ ".${block_class} table td" ] .= "background-color:${value};";
					break;
				case 'cell_padding':
					$styles[ ".${block_class} table th, .${block_class} table td" ] .= "padding:${value};";
					break;
				case 'cell_border_width':
					$styles[ ".${block_class} table th, .${block_class} table td" ] .= "border-width:${value};";
					break;
				case 'cell_border_style':
					$styles[ ".${block_class} table th, .${block_class} table td" ] .= "border-style:${value};";
					break;
				case 'cell_border_color':
					$styles[ ".${block_class} table th, .${block_class} table td" ] .= "border-color:${value};";
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
	 * Get responsive style with variable breakpoints.
	 *
	 * @return string
	 */
	public static function get_responsive_css() {
		$breakpoint = get_option( FTB_OPTION_PREFIX . '_breakpoint', Settings::OPTIONS['breakpoint']['default'] );
		$max_width  = $breakpoint;
		$min_width  = $max_width + 1;

		$css .= <<<EOM
		@media screen and (min-width:{$min_width}px) {
		}
		@media screen and (max-width:{$max_width}px) {
		}
		EOM;

		return $css;
	}

	/**
	 * Minify CSS.
	 *
	 * @return string
	 */
	public static function minify_css( $css ) {
		// Minify CSS.
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
