import * as webpack from 'webpack';
import * as ts from 'typescript';

import {autoPonyfillTransformer} from '../src/autoPonyfill';

const compiler = webpack({
    mode: 'none',
    entry: `${__dirname}/src/entry.ts`,
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [ __dirname + '/src/' ],
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: __dirname + '/src/tsconfig.json',
                    getCustomTransformers: (program: ts.Program) => ({
                        before: [
                            autoPonyfillTransformer({
                                typeChecker: program.getTypeChecker(),
                                ponyfillMethods: {
                                    [`Array@${require.resolve('typescript/lib/lib.es6.d.ts')}`]: {
                                        file: __dirname + '/src/arrayPonyfills.ts',
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
});

const myFs = compiler.outputFileSystem = new class implements webpack.OutputFileSystem {
    public files = new Map<string, any>();

    private _normalize(path: string) { return path.replace(/\/{2,}/g, '/'); }

    join(...paths: string[]): string { return this._normalize(paths.join('/')); }
    mkdir(path: string, callback: (err: Error) => void): void { callback(null); }
    mkdirp(path: string, callback: (err: Error) => void): void { callback(null); }
    purge(): void { this.files.clear(); }
    rmdir(path: string, callback: (err: Error) => void): void {
        path = this._normalize(path + '/');
        for (const filename of this.files.keys()) {
            if (filename.startsWith(path)) {
                this.files.delete(filename);
            }
        }

        callback(null);
    }
    unlink(path: string, callback: (err: Error) => void): void {
        this.files.delete(this._normalize(path));
        callback(null);
    }
    writeFile(path: string, data: any, callback: (err: Error) => void): void {
        if (data instanceof Buffer) {
            data = data.toString('utf8');
        }
        console.log(path, data);

        this.files.set(this._normalize(path), data);
        callback(null);
    }
};

compiler.run((err, stats) => {
    try {
        for (const err of stats.compilation.errors) {
            console.error(err);
        }

        for (const name of myFs.files.keys()) {
            console.log(name, myFs.files.get(name));
        }
    } catch (e) {
        console.error(e);
    }
});
