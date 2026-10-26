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
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
		rules: {
			'import/no-extraneous-dependencies': 'off',
			'react/jsx-boolean-value': 'error',
			'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ],
			'jsdoc/escape-inline-tags': 'error',
			'@wordpress/wp-global-usage': 'error',
			'@wordpress/data-no-store-string-literals': 'error',
			'@wordpress/components-no-unsafe-button-disabled': 'error',
			'@wordpress/components-no-missing-40px-size-prop': 'error',
			'@wordpress/react-no-unsafe-timeout': 'error',
			'@wordpress/dependency-group': 'error',
			'@wordpress/no-unsafe-wp-apis': 'off',
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
		},
	},
	{
		files: [ '**/*.ts', '**/*.tsx' ],
		rules: {
			'@typescript-eslint/ban-ts-comment': [
				'error',
				{
					'ts-expect-error': 'allow-with-description',
					'ts-ignore': true,
					'ts-nocheck': true,
					'ts-check': false,
				},
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					disallowTypeAnnotations: false,
				},
			],
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'react',
							message: 'Please use React API through `@wordpress/element` instead.',
							allowTypeImports: true,
						},
					],
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
