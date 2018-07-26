// $ npx ts-node $(npm bin)/webpack

const {autoPonyfillTransformer} = require('../../src/autoPonyfill.ts');

module.exports = {
    mode: 'none',
    entry: __dirname + '/entry.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: __dirname + '/tsconfig.json',
                    getCustomTransformers: (program) => ({
                        before: [
                            autoPonyfillTransformer({
                                typeChecker: program.getTypeChecker(),
                                ponyfillMethods: {
                                    [`Array@${require.resolve('typescript/lib/lib.es6.d.ts')}`]: {
                                        file: __dirname + '/arrayPonyfills.ts',
                                        methods: {
                                            map: true,
                                            filter: 'myFilter'
                                        }
                                    }
                                }
                            })
                        ]
                    })
                }
            }
        ]
    }
};
