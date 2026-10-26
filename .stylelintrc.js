module.exports = {
	extends: [ '@wordpress/stylelint-config/scss-stylistic' ],
	rules: {
		'selector-class-pattern': null,
		'value-keyword-case': [
			'lower',
			{
				camelCaseSvgKeywords: true,
			},
		],
	},
};
