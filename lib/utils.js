/*
 * @Description:
 * @version:
 * @Author:
 * @Date: 2024-04-15 22:59:46
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-04-15 23:14:39
 */
export var validTopFunctionPath = function (path) {
    return !path.findParent(function (p) { return p.isArrowFunctionExpression() || p.isFunctionExpression(); });
};
