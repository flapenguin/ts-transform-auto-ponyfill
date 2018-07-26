# `ts-transform-auto-ponyfill` - automatic ponyfills for TypeScript

> Transforms calls of methods on prototype to calls of free functions.
>
> E.g. `[1,2,3].filter(cb)` to `myUtils.filter([1,2,3], cb)`.

**STATE: Proof of concept**

## Example: `webpack` with `awesome-typescript-loader`

See [`test/src/webpack.config.js`](./test/src/webpack.config.js)

## Example: general

Converts
```ts
function f() {
    return [1, 2, 3];
}
f().includes(2);
```

to
```js
import * as arrayPonyfills from './arrayPonyfills';
function f() {
    return [1, 2, 3];
}
arrayPonyfills.includes(f(), 2);
```

given configuration

```js
autoPonyfill({
    typeChecker: program.getTypeChecker(),
    ponyfillMethods: {
        [`Array@${require.resolve('typescript/lib/lib.es6.d.ts')}`]: {
            file: require.resolve('./arrayPonyfills.ts'),
            methods: {
                includes: true
            }
        }
    }
})
```