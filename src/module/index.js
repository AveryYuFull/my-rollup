const MagicString = require('magic-string');
const { parse } = require('acorn');
const analyse = require('../ast/analyse');
const hasOwn = require('../utils/hasOwn');

/**
 * 模块定义
 * @class Module
 */
class Module {
    /**
     * Module构造方法
     * @param {Object} options 选项参数
     * @param {String} options.path 模块路径
     * @param {String} options.code 模块代码
     * @param {Bundle} options.bundle 打包对象
     */
    constructor ({ path, code, bundle }) {
        const _that = this;
        _that.path = path;
        _that.code = new MagicString(code, {
            filename: path
        });
        _that.bundle = bundle;
        _that.ast = parse(code, {
            sourceType: 'module',
            ecmaVersion: 7
        });
        _that.analyse();
    }

    /**
     * 分析ast语法树
     */
    analyse () {
        /**
         * 实现tree-shaking的3个步骤
         * 1. 找出所有在本模块中使用的变量
         * 2. 找出所有这些变量的定义，然后导入进来
         * 3. 删除无用的代码
         */
        const _that = this;
        _that.imports = {};
        _that.exports = {};
        _that.ast.body.forEach((node) => {
            switch (node.type) {
                case 'ImportDeclaration':
                    const specifiers = node.specifiers || [];
                    const source = node.source.value;
                    specifiers.forEach((specifier) => {
                        const name = specifier.imported.name;
                        const localName = specifier.local.name;
                        _that.imports[name] = { name, localName, source };
                    });
                    break;
                case 'ExportNamedDeclaration':
                    const declarations = node.declaration.declarations;
                    declarations.forEach((declaration) => {
                        const name = declaration.id.name;
                        _that.exports[name] = { node, localName: name, expression: node.declaration };
                    });
                    break;
            }
        });
        analyse(_that.ast, _that.code);
        _that.definations = {};
        _that.ast.body.forEach((statement) => {
            Object.keys(statement._defines).forEach((name) => {
                _that.definations[name] = statement;
            });
        });
    }

    /**
     * 展开所有的语句
     */
    expandAllStatements () {
        const _that = this;
        let allStatements = [];
        _that.ast.body.forEach((statement) => {
            if (statement.type === 'ImportDeclaration') {
                return;
            }
            let statements = _that.expandStatement(statement);
            allStatements.push(...statements);
        });
        return allStatements;
    }

    /**
     * 展开语句
     * @param {Object} statement 语句
     * @returns {Array}
     */
    expandStatement (statement) {
        const _that = this;
        let result = [];
        const _dependencies = Object.keys(statement._dependsOn);;
        _dependencies.forEach((name) => {
            let defination = _that.define(name);
            result.push(...defination);
        });
        if (!statement._included) {
            statement._included = true;
            result.push(statement);
        }
        return result;
    }

    /**
     * 找到变量定义的节点
     * @param {String} name 变量名称
     * @returns {Array}
     */
    define (name) {
        const _that = this;
        const _imports = _that.imports || {};
        if (hasOwn(_imports, name)) {
            const importData = _imports[name];
            const module = _that.bundle.fetchModule(importData.source, _that.path);
            const exportData = module.exports[importData.name];
            return module.define(exportData.localName);
        } else {
            const statement = _that.definations[name];
            if (statement && !statement._included) {
                return _that.expandStatement(statement);
            } else {
                return [];
            }
        }
    }
}

module.exports = Module;
