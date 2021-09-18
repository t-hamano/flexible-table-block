<?php
/**
 * @package flexible-table-block
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

namespace flexible_table_block;

class Settings {

	const BLOCK_STYLE = <<< EOM
	.wp-block-flexible-table-block-table table {
		width: 100%;
		max-width: 100%;
		border-collapse: collapse;
	}
	.wp-block-flexible-table-block-table th,
	.wp-block-flexible-table-block-table td {
		word-break: normal;
		border: 1px solid;
		text-align: left;
	}
	.wp-block-flexible-table-block-table th {
		background-color: #ddd;
	}
	.wp-block-flexible-table-block-table.is-style-stripes tbody tr:nth-child(odd) {
		background-color: #eee;
	}
	.wp-block-flexible-table-block-table figcaption {
		margin: 0.5em 0;
	}
	EOM;

	// Default options.
	const OPTIONS = array(

		// Show section labels on table in the editor.
		'show_label_on_section' => array(
			'type'    => 'boolean',
			'default' => true,
		),
		// Show dot on th tag in the editor.
		'show_dot_on_th'        => array(
			'type'    => 'boolean',
			'default' => true,
		),
		// Show global settings link to non-administrative users.
		'show_global_setting'   => array(
			'type'    => 'boolean',
			'default' => false,
		),
		// Set the screen width (breakpoint) as the basis for switching between PC and mobile devices.
		'breakpoint'            => array(
			'type'    => 'number',
			'default' => 768,
			'range'   => array(
				'min' => 200,
				'max' => 1200,
			),
		),
		// Global Block CSS.
		'css'                   => array(
			'type'              => 'string',
			'default'           => self::BLOCK_STYLE,
			'sanitize_callback' => 'sanitize_css',
		),
	);

	/**
	 * Constructor
	 */
	public function __construct() {
	}

	/**
	 * Get options.
	 *
	 * @return array
	 */
	public static function get_options() {
		$options = array();
		foreach ( self::OPTIONS as $key => $value ) {
			$options[ $key ] = get_option( FTB_OPTION_PREFIX . '_' . $key, self::OPTIONS[ $key ]['default'] );
		}
		return $options;
	}
}

new Settings();
