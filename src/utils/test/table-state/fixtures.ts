/**
 * Internal dependencies
 */
import { toVirtualTable } from '../../table-state';

// | head-0   | head-1   | head-2   |
// | body-0-0 | body-0-1 | body-0-2 |
// | body-1-0 | body-1-1 | body-1-2 |
// | body-2-0 | body-2-1 | body-2-2 |
// | foot-0   | foot-1   | foot-2   |
export const createVTable = () =>
	toVirtualTable( {
		head: [
			{
				cells: [
					{ content: 'head-0', tag: 'th' },
					{ content: 'head-1', tag: 'th' },
					{ content: 'head-2', tag: 'th' },
				],
			},
		],
		body: [
			{
				cells: [
					{ content: 'body-0-0', tag: 'td' },
					{ content: 'body-0-1', tag: 'td' },
					{ content: 'body-0-2', tag: 'td' },
				],
			},
			{
				cells: [
					{ content: 'body-1-0', tag: 'td' },
					{ content: 'body-1-1', tag: 'td' },
					{ content: 'body-1-2', tag: 'td' },
				],
			},
			{
				cells: [
					{ content: 'body-2-0', tag: 'td' },
					{ content: 'body-2-1', tag: 'td' },
					{ content: 'body-2-2', tag: 'td' },
				],
			},
		],
		foot: [
			{
				cells: [
					{ content: 'foot-0', tag: 'td' },
					{ content: 'foot-1', tag: 'td' },
					{ content: 'foot-2', tag: 'td' },
				],
			},
		],
	} );

// Merged cells repeat the same name.
// | head-0   | head-1   | head-2   |
// | body-0-0 | body-0-0 | body-0-2 |
// | body-0-0 | body-0-0 | body-1-2 |
// | body-2-0 | body-2-1 | body-2-2 |
// | foot-0   | foot-1   | foot-2   |
export const createMergedVTable = () =>
	toVirtualTable( {
		head: [
			{
				cells: [
					{ content: 'head-0', tag: 'th' },
					{ content: 'head-1', tag: 'th' },
					{ content: 'head-2', tag: 'th' },
				],
			},
		],
		body: [
			{
				cells: [
					{ content: 'body-0-0', tag: 'td', rowSpan: '2', colSpan: '2' },
					{ content: 'body-0-2', tag: 'td' },
				],
			},
			{ cells: [ { content: 'body-1-2', tag: 'td' } ] },
			{
				cells: [
					{ content: 'body-2-0', tag: 'td' },
					{ content: 'body-2-1', tag: 'td' },
					{ content: 'body-2-2', tag: 'td' },
				],
			},
		],
		foot: [
			{
				cells: [
					{ content: 'foot-0', tag: 'td' },
					{ content: 'foot-1', tag: 'td' },
					{ content: 'foot-2', tag: 'td' },
				],
			},
		],
	} );
