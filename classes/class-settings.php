<?php
/**
 * @package Flexible_Table_Block;
 * @author Tetsuaki Hamano
 * @license GPL-2.0+
 */

namespace Flexible_Table_Block;

class Settings {

	// Default options.
	const OPTIONS = array(

		// Show section labels on table in the editor.
		'show_label_on_section' => array(
			'type'    => 'boolean',
			'default' => true,
		),
		// Show insert row/column buttons.
		'show_control_button'   => array(
			'type'    => 'boolean',
			'default' => true,
		),
		// Focus insert/select buttons, select row/column buttons, section label from being focused when moving with the crosshairs.
		'focus_control_button'  => array(
			'type'    => 'boolean',
			'default' => false,
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
		// Default table styles.
		'block_style'           => array(
			'type'    => 'array',
			'default' => array(
				'table_width'              => '100%',
				'table_max_width'          => '100%',
				'table_border_collapse'    => 'collapse',
				'row_odd_color'            => '#f0f0f1',
				'row_even_color'           => '#ffffff',
				'cell_text_color_th'       => null,
				'cell_text_color_td'       => null,
				'cell_background_color_th' => '#f0f0f1',
				'cell_background_color_td' => '#ffffff',
				'cell_padding'             => '0.5em',
				'cell_border_width'        => '1px',
				'cell_border_style'        => 'solid',
				'cell_border_color'        => '#000000',
				'cell_text_align'          => 'left',
				'cell_vertical_align'      => 'middle',
			),
		),
	);

	/**
	 * Constructor
	 */
	public function __construct() {
	}

	/**
	 * Get options
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
