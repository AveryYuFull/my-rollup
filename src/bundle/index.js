const fs = require('fs');
const mkdirp = require('mkdirp');
const MagicString = require('magic-string');
const path = require('path');
const Module = require('../module');

class Bundle {
    /**
     * 构造方法
     * @param {Object} options 选项参数
     * @param {String} options.entry 入口文件地址
     */
    constructor (options = {}) {
        const _that = this;
        _that.entryPath = options.entry.replace(/\.js$/, '') + '.js';
        _that.modules = {};
    }

    /**
     * 打包
     * @param {Object} options 选项参数
     */
    build (options = {}) {
        const _that = this;
        const entryModule = _that.fetchModule(_that.entryPath);
        const statements = entryModule.expandAllStatements();
        const { code } = _that.generate(statements);
        mkdirp(options.path).then(() => {
            fs.writeFileSync(path.posix.join(options.path, options.filename), code, 'utf8');
        });
    }


    /**
     * 生成代码
     * @param {Array} statements 语句片段
     * @returns {Object}
     */
    generate (statements) {
        const magicString = new MagicString.Bundle();
        statements.forEach((statement, index) => {
            if (index === 0) {
                magicString.addSource({
                    content: '"use strict"',
                    seperator: '\n'
                });
            }
            const source = statement._source;
            if (statement.type === 'ExportNamedDeclaration') {
                source.remove(statement.start, statement.declaration.start);
            }
            magicString.addSource({
                content: source,
                seperator: '\n'
            });
        });
        return {
            code: magicString.toString()
        }
    }

    /**
     * 将被导入的文件转化为Module对象
     * @param {String} importee 导入文件地址
     * @param {String} importer 在哪个模块导入
     * @returns {Module}
     */
    fetchModule (importee, importer) {
        const _that = this;
        let route;
        if (!importer || importee.charAt(0) !== '.') {
            route = importee;
        } else {
            route = path.posix.join(path.posix.dirname(importer), importee);
        }
        if (route) {
            const code = fs.readFileSync(route.replace(/\.js$/, '') + '.js', 'utf8');
            const module = new Module({
                path: route,
                code,
                bundle: _that
            });
            _that.modules[route] = module;
            return module;
        }
    }
}

module.exports = Bundle;
