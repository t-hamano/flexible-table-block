/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export default {
	attributes: {
		head: [
			{
				cells: [
					{
						content: __( 'Version', 'flexible-table-block' ),
						tag: 'th',
					},
					{
						content: __( 'Jazz Musician', 'flexible-table-block' ),
						tag: 'th',
					},
					{
						content: __( 'Release Date', 'flexible-table-block' ),
						tag: 'th',
					},
				],
			},
		],
		body: [
			{
				cells: [
					{
						content: '5.2',
						tag: 'td',
					},
					{
						content: 'Jaco Pastorius',
						tag: 'td',
					},
					{
						content: __( 'May 7, 2019' ),
						tag: 'td',
					},
				],
			},
			{
				cells: [
					{
						content: '5.1',
						tag: 'td',
					},
					{
						content: 'Betty Carter',
						tag: 'td',
					},
					{
						content: __( 'February 21, 2019' ),
						tag: 'td',
					},
				],
			},
			{
				cells: [
					{
						content: '5.0',
						tag: 'td',
					},
					{
						content: 'Bebo Valdés',
						tag: 'td',
					},
					{
						content: __( 'December 6, 2018' ),
						tag: 'td',
					},
				],
			},
		],
	},
};
