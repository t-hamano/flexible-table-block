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
						content: '5.8',
						tag: 'td',
					},
					{
						content: 'Art Tatum',
						tag: 'td',
					},
					{
						content: __( 'July 20, 2021', 'flexible-table-block' ),
						tag: 'td',
					},
				],
			},
			{
				cells: [
					{
						content: '5.7',
						tag: 'td',
					},
					{
						content: 'Esperanza Spalding',
						tag: 'td',
					},
					{
						content: __( 'March 9, 2021', 'flexible-table-block' ),
						tag: 'td',
					},
				],
			},
			{
				cells: [
					{
						content: '5.6',
						tag: 'td',
					},
					{
						content: 'Nina Simone',
						tag: 'td',
					},
					{
						content: __(
							'December 8, 2020',
							'flexible-table-block'
						),
						tag: 'td',
					},
				],
			},
		],
	},
};
