/**
 * WordPress dependencies
 */
const config = require( '@wordpress/scripts/config/jest-unit.config.js' );

module.exports = {
	...config,
	rootDir: '../../',
	testPathIgnorePatterns: [ '<rootDir>/test/e2e' ],
};
