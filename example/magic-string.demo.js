const MagicString = require('magic-string');
let magicString = new MagicString("export var name = 'name'");
console.log('snip-->', magicString.snip(0, 6).toString());
console.log('remove->', magicString.remove(0, 6).toString());

var bundle = new MagicString.Bundle();
 
bundle.addSource({
  filename: 'foo.js',
  content: new MagicString( 'var answer = 42;' )
});
 
bundle.addSource({
  filename: 'bar.js',
  content: new MagicString( 'console.log( answer )' )
});
console.log(bundle.toString());