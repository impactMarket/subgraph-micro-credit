// .eslintrc.js
module.exports = {
    env: {
        es2020: true,
        mocha: true,
        node: true
    },
    extends: ['impact-market/node'],
    rules: {
        'max-params': ['error', 10],
        'no-underscore-dangle': 'off',
        'prefer-destructuring': 'off'
    }
};
