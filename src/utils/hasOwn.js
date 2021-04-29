/**
 * 判断某个对象是否有对应的属性
 * @param {Object} obj 对象
 * @param {String} key 属性名称
 * @returns {Boolean}
 */
function hasOwn (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

module.exports = hasOwn;
