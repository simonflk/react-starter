/* eslint-env node */
const commonPlugins = [
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
];
module.exports = {
    env: {
        modern: {
            presets: [
                '@babel/preset-modules',
                [
                    '@babel/preset-react',
                    {
                        useBuiltIns: true,
                        development: process.env.NODE_ENV !== 'production',
                    },
                ],
            ],
            plugins: [...commonPlugins],
        },
        legacy: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        corejs: 3,
                        modules: false,
                        useBuiltIns: 'entry',
                        targets: '> 0.25%, last 2 versions, Firefox ESR',
                    },
                ],
                ['@babel/preset-react', {development: process.env.NODE_ENV !== 'production'}],
            ],
            plugins: [...commonPlugins],
        },
    },
};
