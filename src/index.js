/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import metadata from './block.json';
import example from './example';
import icon from './icon';
import edit from './edit';
import save from './save';

registerBlockType( metadata, {
	icon,
	example,
	edit,
	save
});
