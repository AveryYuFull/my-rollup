const Scope = require('../src/ast/Scope');

var a = 1;
function one () {
    var b = 2;
    function two () {
        var c = 3;
        console.log(a, b, c);
    }
    two();
}
one();

let globalScope = new Scope({ name: 'globalScope', parent: null, params: ['a'] });
let oneScope = new Scope({ name: 'oneScope', parent: globalScope, params: ['b'] });
let twoScope = new Scope({ name: 'twoScope', parent: oneScope, params: ['c'] });

let aScope = twoScope.findDefiningScope('a');
console.log(aScope.name);
let bScope = twoScope.findDefiningScope('b');
console.log(bScope.name);
let cScope = twoScope.findDefiningScope('c');
console.log(cScope.name);
let dScope = twoScope.findDefiningScope('d');
console.log(dScope);
