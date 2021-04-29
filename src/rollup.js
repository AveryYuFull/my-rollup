const Bundle = require('./bundle');

function rollup (entry, options) {
    // bundle代表打包对象，里面包含了所有模块信息，可以认为就是webpack中的compliation
    const bundle = new Bundle({ entry });
    bundle.build(options);
}

module.exports = rollup;
