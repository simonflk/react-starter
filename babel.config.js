/* eslint-env node */
module.exports = {
    env: {
        modern: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        useBuiltIns: false,
                        targets: {esmodules: true},
                    },
                ],
                [
                    '@babel/preset-react',
                    {
                        useBuiltIns: true,
                        development: process.env.NODE_ENV !== 'production',
                    },
                ],
            ],
            plugins: [],
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
            plugins: [],
        },
    },
};
