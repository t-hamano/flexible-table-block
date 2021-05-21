import { registerBlockType } from '@wordpress/blocks';
import { blockTable as icon } from '@wordpress/icons';

import edit from './edit';
import save from './save';

import './style.scss';
import './editor.scss';

registerBlockType( 'flexible-table-block/table', {
	title: 'Flexible Table',
	description: '柔軟な構成のテーブルを作成することが出来ます。',
	icon,
	category: 'common',
	supports: {
		align: [ 'center' ]
	},
	attributes: {
		head: {
			type: 'array',
			default: [],
			source: 'query',
			selector: 'thead tr',
			query: {
				cells: {
					type: 'array',
					default: [],
					source: 'query',
					selector: 'td, th',
					query: {
						content: {
							source: 'html'
						},
						styles: {
							type: 'string',
							source: 'attribute',
							attribute: 'style'
						},
						colSpan: {
							type: 'string',
							source: 'attribute',
							attribute: 'colspan'
						},
						rowSpan: {
							type: 'string',
							source: 'attribute',
							attribute: 'rowspan'
						}
					}
				}
			}
		},
		body: {
			type: 'array',
			default: [],
			source: 'query',
			selector: 'tbody tr',
			query: {
				cells: {
					type: 'array',
					default: [],
					source: 'query',
					selector: 'td',
					query: {
						content: {
							source: 'html'
						},
						styles: {
							type: 'string',
							source: 'attribute',
							attribute: 'style'
						},
						colSpan: {
							type: 'string',
							source: 'attribute',
							attribute: 'colspan'
						},
						rowSpan: {
							type: 'string',
							source: 'attribute',
							attribute: 'rowspan'
						}
					}
				}
			}
		},
		foot: {
			type: 'array',
			default: [],
			source: 'query',
			selector: 'tfoot tr',
			query: {
				cells: {
					type: 'array',
					default: [],
					source: 'query',
					selector: 'td, th',
					query: {
						content: {
							source: 'html'
						},
						styles: {
							type: 'string',
							source: 'attribute',
							attribute: 'style'
						},
						colSpan: {
							type: 'string',
							source: 'attribute',
							attribute: 'colspan'
						},
						rowSpan: {
							type: 'string',
							source: 'attribute',
							attribute: 'rowspan'
						}
					}
				}
			}
		},
		tableWidth: {
			type: 'number'
		},
		fontSize: {
			type: 'number'
		},
		lineHeight: {
			type: 'number'
		},
		padding: {
			type: 'number'
		},
		firstColumnWidth: {
			type: 'number'
		},
		hasFixedLayout: {
			type: 'boolean',
			default: false
		},
		isStackedOnMobile: {
			type: 'boolean',
			default: false
		},
		isScrollOnMobile: {
			type: 'boolean',
			default: false
		},
		borderWidth: {
			type: 'number'
		},
		borderColor: {
			type: 'string'
		}
	},
	edit,
	save
});
