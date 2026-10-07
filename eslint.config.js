/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/eslint-plugin' );

module.exports = [
	{
		ignores: [ '**/node_modules/**', '**/vendor/**', '**/build/**' ],
	},
	...defaultConfig.configs.recommended,
	{
		rules: {
			'import/no-extraneous-dependencies': 'off',
			'react/jsx-boolean-value': 'error',
			'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ],
			'@wordpress/dependency-group': 'error',
			'@wordpress/no-unsafe-wp-apis': 'off',
			'@wordpress/no-setting-ds-tokens': 'off',
			'@wordpress/no-unknown-ds-tokens': 'off',
			'@wordpress/use-import-as': [
				'error',
				{
					'@wordpress/block-editor': {
						__experimentalGetColorClassesAndStyles: 'getColorClassesAndStyles',
						__experimentalUseColorProps: 'useColorProps',
					},
					'@wordpress/components': {
						__experimentalGrid: 'Grid',
						__experimentalHeading: 'Heading',
						__experimentalParseQuantityAndUnitFromRawValue: 'parseQuantityAndUnitFromRawValue',
						__experimentalToggleGroupControl: 'ToggleGroupControl',
						__experimentalToggleGroupControlOption: 'ToggleGroupControlOption',
						__experimentalToggleGroupControlOptionIcon: 'ToggleGroupControlOptionIcon',
						__experimentalUnitControl: 'UnitControl',
						__experimentalUseCustomUnits: 'useCustomUnits',
					},
				},
			],
			'@wordpress/i18n-text-domain': [
				'error',
				{
					allowedTextDomain: 'flexible-table-block',
				},
			],
			'prettier/prettier': [
				'error',
				{
					useTabs: true,
					tabWidth: 2,
					singleQuote: true,
					printWidth: 100,
					bracketSpacing: true,
					parenSpacing: true,
					bracketSameLine: false,
				},
			],
		},
	},
	...defaultConfig.configs[ 'test-unit' ].map( ( config ) => ( {
		...config,
		files: [ 'src/**/test/**/*.js', 'src/**/test/**/*.ts' ],
	} ) ),
	...defaultConfig.configs[ 'test-playwright' ].map( ( config ) => ( {
		...config,
		files: [ 'test/e2e/**/*.js', 'test/e2e/**/*.ts' ],
		rules: {
			...config.rules,
			'react-hooks/rules-of-hooks': 'off',
		},
	} ) ),
];
