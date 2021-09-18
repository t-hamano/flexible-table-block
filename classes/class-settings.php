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
		border-spacing: 0;
		border-collapse: separate;
		overflow: hidden;
	}
	.wp-block-flexible-table-block-table th,
	.wp-block-flexible-table-block-table td {
		word-break: normal;
		border: 1px solid;
	}
	.wp-block-flexible-table-block-table th {
		background: #ddd;
	}
	EOM;

	// Default options.
	const OPTIONS = array(

		// Show section labels on table in the editor.
		'show_section_label'  => array(
			'type'    => 'boolean',
			'default' => true,
		),
		// Show global settings link to non-administrative users.
		'show_global_setting' => array(
			'type'    => 'boolean',
			'default' => false,
		),
		// Set the screen width (breakpoint) as the basis for switching between PC and mobile devices.
		'breakpoint'          => array(
			'type'    => 'number',
			'default' => 768,
			'range'   => array(
				'min' => 200,
				'max' => 1200,
			),
		),
		// Global Block CSS.
		'css'                 => array(
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
