# `ts-transform-auto-ponyfill` - automatic ponyfills for TypeScript

> Transforms calls of methods on prototype to calls of free functions.

**STATE: Proof of concept**

## Example

Converts
```ts
function f() {
    return [1, 2, 3];
}
f().contains(2);
```

to
```js
import * as arrayPonyfills from './arrayPolyfills';
function f() {
    return [1, 2, 3];
}
arrayPonyfills.contains(f(), 2);
```

given configuration

```js
autoPonyfill({
    typeChecker: program.getTypeChecker(),
    ponyfillMethods: {
        [`Array@${require.resolve('typescript/lib/lib.es6.d.ts')}`]: {
            file: require.resolve('./arrayPonyfills.ts'),
            methods: {
                contains: true
            }
        }
    }
}),
```