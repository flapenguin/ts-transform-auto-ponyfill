export function map<T, U>(
    array: T[],
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any
): U[] {
    const result = [];
    for (let i = 0, l = array.length; i < l; i++) {
        result.push(callbackfn.call(thisArg, array[i], i, array));
    }
    return result;
}

export function myFilter<T>(
    array: T[],
    callbackfn: (value: T, index: number, array: T[]) => boolean,
    thisArg?: any
): T[] {
    const result = [];
    for (let i = 0, l = array.length; i < l; i++) {
        if (callbackfn.call(thisArg, array[i], i, array)) {
            result.push(array[i]);
        }
    }
    return result;
}
