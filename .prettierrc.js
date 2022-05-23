const config = {
	...require( '@wordpress/prettier-config' ),
	semi: true,
	useTabs: true,
	tabWidth: 2,
	singleQuote: true,
	printWidth: 100,
	bracketSpacing: true,
	parenSpacing: true,
	parser: 'typescript',
	// Set new property instead of jsxBracketSameLine
	bracketSameLine: false,
}

// Remove deprecated property
delete config.jsxBracketSameLine

module.exports = config;
