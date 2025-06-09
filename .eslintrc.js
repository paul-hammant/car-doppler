module.exports = {
    env: {
        browser: true,
        es2021: true,
        worker: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': 'warn',
        'no-undef': 'error'
    },
    globals: {
        'importScripts': 'readonly',
        'FFT': 'readonly',
        'Meyda': 'readonly'
    }
};