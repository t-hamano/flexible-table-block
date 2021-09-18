<?php
/**
 * @package flexible-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

namespace flexible_table_block;

class Helper {

	/**
	 * Get a responsive style with variable breakpoints.
	 *
	 * @return string
	 */
	public static function get_responsive_css( $breakpoint ) {
		$max_width = $breakpoint;
		$min_width = $max_width + 1;

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
