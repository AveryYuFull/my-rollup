/**
 * 遍历ast语法树
 * @param {Object} ast 模块代码的ast语法树
 * @param {Object} options 选项参数
 * @param {Function} options.enter 进入节点的回调方法
 * @param {Function} options.exit 离开节点的回调方法
 */
function walk (ast, { enter, exit }) {
    _visitor(ast, null);
    
    /**
     * 深度优先遍历节点
     * @param {Object} node 当前访问的节点
     * @param {Object} parent 父节点
     */
    function _visitor (node, parent) {
        if (typeof enter == 'function') {
            enter(node, parent);
        }
        const childKeys = Object.keys(node).filter((key) => typeof node[key] === 'object');
        childKeys.forEach((key) => {
            const childNodes = node[key];
            if (!childNodes || typeof childNodes !== 'object') {
                return;
            }
            if (childNodes instanceof Array) {
                childNodes.forEach((childNode) => _visitor(childNode, node));
            } else {
                _visitor(childNodes, node);
            }
        });
        if (typeof exit === 'function') {
            exit(node, parent);
        }
    }
}

module.exports = walk;
