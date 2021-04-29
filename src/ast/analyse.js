const walk = require('./walk');
const Scope = require('./Scope');

/**
 * 分析模块的ast语法树
 * @param {Object} ast ast语法树
 * @param {MagicString} magicString 魔法字符串
 */
function analyse (ast, magicString) {
    /**
     * 1. 找到当前模块中定义的全局变量
     * 2. 找到当前模块依赖的变量
     */
    // 构建作用域链，找到当前模块中定义的全局变量
    let scope = new Scope();
    ast.body.forEach((statement) => {
        Object.defineProperties(statement, {
            _defines: { value: {} },
            _dependsOn: { value: {} },
            _included: { value: false, writable: true },
            _source: { value:  magicString.snip(statement.start, statement.end)}
        });
        walk(statement, {
            enter (node) {
                let newScope;
                switch (node.type) {
                    case 'FunctionDeclaration':
                        const params = (node.params || []).map((item) => item.name);
                        newScope = new Scope({
                            names: params,
                            parent: scope
                        });
                        addToScope(statement, node);
                        break;
                    case 'VariableDeclaration':
                        const declarations = node.declarations || [];
                        declarations.forEach((declaration) => addToScope(statement, declaration));
                        break;
                }
                if (newScope) {
                    scope = newScope;
                    Object.defineProperty(node, '_scope', {
                        value: newScope
                    });
                }
            },
            exit (node) {
                if (node._scope) {
                    scope = scope.parent;
                }
            }
        })
    });
    // 查找当前模块中依赖的外部变量dependsOn
    ast.body.forEach((statement) => {
        walk(statement, {
            enter (node) {
                if (node._scope) {
                    scope = node._scope;
                }
                switch (node.type) {
                    case 'Identifier':
                        let defineScope = scope.findDefiningScope(node.name);
                        if (!defineScope) {
                            statement._dependsOn[node.name] = true;
                        }
                        break;
                }
            },
            exit (node) {
                if (node._scope) {
                    scope = scope.parent;
                }
            }
        })
    });

    /**
     * 将变量添加到作用域中
     * @param {Object} statement 语句节点
     * @param {Object} declaration 变量申明节点
     */
    function addToScope (statement, declaration) {
        const name = declaration.id.name;
        scope.add(name);
        if (!scope.parent) {
            statement._defines[name] = true;
        }
    }
}

module.exports = analyse;
