module.exports = {
	env: {
		es2021: true,
		node: true,
		browser: true,
	},
	extends: ['eslint:recommended', 'plugin:react/recommended'],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['react', 'prettier'],
	rules: {
		'linebreak-style': ['error', 'unix'],
		'react/prop-types': 0,
		'prettier/prettier': 'error',
		'no-mixed-spaces-and-tabs': 0,
	},
};
