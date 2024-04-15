import { NodePath } from "@babel/core"

/*
 * @Description: 
 * @version: 
 * @Author: 
 * @Date: 2024-04-15 22:59:46
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-04-15 23:14:39
 */
export const validTopFunctionPath = (path: NodePath) => {
   return !path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
}