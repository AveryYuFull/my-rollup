/**
 * 作用域对象
 * @class Scope
 */
class Scope {
    /**
     * 构造方法
     * @param {Object} options 选项参数
     * @param {String} options.name 作用域名称
     * @param {Scope} options.parent 父级作用域
     * @param {Array} options.params 作用域中定义的变量
     */
    constructor (options = {}) {
        const _that = this;
        _that.name = options.name;
        _that.parent = options.parent;
        _that.names = options.params || [];
    }

    /**
     * 向作用域中添加变量
     * @param {String} name 变量名称
     */
    add (name) {
        const _that = this;
        if (_that.names.indexOf(name) < 0) {
            _that.names.push(name);
        }
    }

    /**
     * 找到定义变量的作用域
     * @param {String} name 变量名称
     * @returns {Scope}
     */
    findDefiningScope (name) {
        const _that = this;
        if (_that.names.indexOf(name) > -1) {
            return _that;
        }
        if (_that.parent) {
            return _that.parent.findDefiningScope(name);
        }
        return null;
    }
}

module.exports = Scope;
