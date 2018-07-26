const a = [1,2,3,4];

const cb = x => x;

a.map(cb);
a.filter(cb);
[1,2,3,4].map(cb);
[1,2,3,4].filter(cb);

a.map(cb).filter(cb).reduce((s, m) => s + m);

class Array {
    map(...x: any[]) {}
}

const b = new Array();
b.map(cb);

export default 0;
