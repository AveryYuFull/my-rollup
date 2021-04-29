let acorn = require("acorn");
console.log(acorn.parse(`import { name, age } from './msg'
function say (home) {
	console.log('hello', name, home);
}
say();`, {ecmaVersion: 8, sourceType:'module'}));