module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
        ecmaFeatures: {
            jsx: true // Allows for the parsing of JSX
        }
    },
    settings: {
        react: {
            version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
        }
    },
    plugins: [
        '@typescript-eslint',
        'prettier',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
        //'airbnb-typescript',
        //'prettier',
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "prettier/prettier": ["error", { "endOfLine": "auto" }] 
    },
    overrides: [
        {
            files: ['*.jsx', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': ['off'],
            },
        },
    ],
};
