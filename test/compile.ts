import * as ts from 'typescript';
import * as fs from 'fs';

import autoPonyfill from '../src/autoPonyfill';

const config: ts.CompilerOptions = {
    outFile: 'out.js',
    module: ts.ModuleKind.AMD,
    target: ts.ScriptTarget.ES2015
};

const sources = [
    `${__dirname}/src/entry.ts`,
    // TODO: program do not automatically add new imports
    `${__dirname}/src/arrayPonyfills.ts`
];

const host = ts.createCompilerHost(config);
const program = ts.createProgram(sources, config, host);

function write(fileName: string, data: string) {
    console.log('===========================');
    console.log('==============', fileName);
    console.log('===========================');
    console.log(data);
}

const emit = program.emit(undefined, write, undefined, undefined, {
    before: [
        autoPonyfill({
            typeChecker: program.getTypeChecker(),
            ponyfillMethods: {
                [`Array@${require.resolve('typescript/lib/lib.es6.d.ts').replace(/\\/g, '/')}`]: {
                    file: require.resolve('./src/arrayPonyfills.ts').replace(/\\/g, '/'),
                    methods: {
                        map: true,
                        filter: 'myFilter'
                    }
                }
            }
        }),
    ],
    after: [
        (ctx: ts.TransformationContext) => (file: ts.SourceFile) => {
            return ts.visitNode(file, function visitor(node: ts.Node): ts.Node {
                return ts.visitEachChild(node, visitor, ctx);
            });
        },
    ]
});

const diagnostics = ts.getPreEmitDiagnostics(program).concat(emit.diagnostics)

for (const diagnostic of diagnostics) {
    const { line = 0, character = 0 } = diagnostic.start ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start) : {};
    const { fileName = 'none' } = diagnostic.file || {};
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    console.log(`${fileName} (${line + 1},${character + 1}): ${message}`)
}
