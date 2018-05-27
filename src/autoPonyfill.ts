import * as ts from 'typescript';
import * as path from 'path';

export interface Options {
    typeChecker: ts.TypeChecker;
    ponyfillMethods: Record<string, {
        file: string;
        methods: Record<string, string | boolean>;
    }>;
}

function createVisitor(ctx: ts.TransformationContext, file: ts.SourceFile, options: Options) {
    const newDeclarations: Record<string, ts.ImportDeclaration> = {};

    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        const pass = () => ts.visitEachChild(node, visitor, ctx);

        if (!ts.isCallExpression(node)) {
            return pass();
        }

        const method = node.expression;
        if (!ts.isPropertyAccessExpression(method)) {
            return pass();
        }

        const methodName = method.name.text;
        const type = options.typeChecker.getTypeAtLocation(method.expression);

        const symbol = type.getSymbol()!;
        if (!symbol.valueDeclaration) {
            return pass();
        }

        const symbolFile = symbol.valueDeclaration.getSourceFile().fileName;

        const ponyfill = options.ponyfillMethods[`${symbol.name}@${symbolFile}`];
        if (!ponyfill || !ponyfill.methods[methodName]) {
            return pass();
        }

        const newMethodName = ponyfill.methods[methodName] === true
            ? methodName
            : ponyfill.methods[methodName] as string;

        newDeclarations[file.fileName] = newDeclarations[file.fileName] ||
            ts.createImportDeclaration(
                /* decorators */ undefined,
                /* modifiers */ undefined,
                ts.createImportClause(
                    ts.createUniqueName(
                        `${path.parse(ponyfill.file).name.replace(/\W/g, '_')}`
                    ),
                    undefined
                ),
                ts.createLiteral(
                    './' + path.relative(path.dirname(file.fileName), ponyfill.file).replace(/\.\w+$/, '')
                )
            );

        const importName = newDeclarations[file.fileName].importClause!.name!;
        return ts.updateCall(node,
            ts.createPropertyAccess(importName, ts.createIdentifier(newMethodName)),
            undefined,
            [method.expression, ...node.arguments]
        );
    };

    return { visitor, declarations: newDeclarations };
}

export default function (options: Options) {
    return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        return (file: ts.SourceFile) => {
            const { visitor, declarations } = createVisitor(ctx, file, options)
            let f = ts.visitNode(file, visitor);

            // TODO: synchronize names in import and calls
            f = ts.updateSourceFileNode(f, [
                ...Object.keys(declarations).map(x => declarations[x]),
                ...f.statements
            ]);
            return f;
        };
    };
}
