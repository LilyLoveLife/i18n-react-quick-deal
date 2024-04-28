import { NodePath } from "@babel/core"
import t, { Program, ImportDeclaration, FunctionDeclaration, ArrowFunctionExpression, FunctionExpression, BlockStatement} from '@babel/types'
import babel from '@babel/core'
import fs from 'fs'
import path from 'path'
import _generator from '@babel/generator'
import {Statement} from '@babel/types'
import chalk from 'chalk'
const template = babel.template
const generator = (_generator as any).default
const traverse = babel.traverse

const ImportStr_notHooks = 'import { t } from "i18next"'
const NotHooksStr = 'const { t } = i18next'
const exposeHookFunc_codeStr = 'const {t} = useTranslation()'
// i18n-ignore
export const shouldIgnore = (path: NodePath) => {
  return path.node.leadingComments?.find(comment => comment.value.includes('i18n-ignore'))
}
// path本身是一个函数节点
export const isTopFunction = (path: NodePath) => {
   return isFunction(path)
          && !path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
}

export const getTopMostFunctionPath = (path: NodePath) => {
  let parentFunc = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression() || p.isFunctionDeclaration())
  while (parentFunc) {
    if (parentFunc.node.type === 'Program') {
      break
    }
    let temp = parentFunc.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression() || p.isFunctionDeclaration())
    if (!temp) {
      break
    }
    parentFunc = temp
  }
  if (parentFunc) {
    return parentFunc
  }
  if (isFunction(path)) {
    return path
  }
  return null
}

export const getParentFunctionPath = (path: NodePath) => {
  const parentFunc = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression() || p.isFunctionDeclaration())
  if (parentFunc) {
    return parentFunc
  }
  if (isFunction(path)) {
    return path
  }
}
// path本身可以是任意类型节点
export const isInFunction = (path: NodePath) => {
  return path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
}
export const getTopPath = (path: NodePath) => {
  const programPath = path.findParent(p => p.isProgram()) as NodePath<Program>
  return programPath
}
export const getAllImport = (path: NodePath) => {
  const programPath = getTopPath(path)
  const importList = programPath?.node.body.filter((item)=> item.type === 'ImportDeclaration') as ImportDeclaration[]
  return importList
}
export const hasTranslated = (path: NodePath, transFuncName: string) => {
  const {parent: parentNode} = path
  const translated = parentNode?.type === 'CallExpression'
      &&  parentNode?.callee.type === 'Identifier'
      && parentNode?.callee?.name === transFuncName
  return !!translated
}
export const dealWithImport = (path: NodePath) => {
  // 如果可用hooks，插入'import { useTranslation } from "react-i18next"'
  if (shouldImport_transFunc_hook(path)) {
    checkAndImport_transFunc_hook(path)
  }
  // 如果不可用hooks，插入'import { t } from "i18next"'
  if (shouldImport_transFunc_notHook(path)) {
    checkAndImport_transFunc_notHook(path)
  }
}
export const shouldImport_transFunc_hook = (path: NodePath) => {
  const topFuncPath = getTopMostFunctionPath(path)
  return !!(
    topFuncPath
    && (
      isCustomReactHookFunc(topFuncPath) || isReactFuncComp(topFuncPath)
    )
  )
}
export const shouldImport_transFunc_notHook = (path: NodePath) => {
  const topFuncPath = getTopMostFunctionPath(path)

  return !(
    topFuncPath
    && (
      isCustomReactHookFunc(topFuncPath) || isReactFuncComp(topFuncPath)
    )
  )
}
export const hasImported_transFunc =  (path: NodePath, imported: string, source: string) => {
  const importList:ImportDeclaration[] = getAllImport(path)
  
  return !!importList.find(item => {
    const sourceOk = item.source.value === source
    const importedOk = item.specifiers.find((item) => {
      if (item.type === 'ImportSpecifier') {
        if (item.imported && item.imported.type === 'Identifier') {
            return item.imported.name === imported
        }
      }
      return false
    })
    return !!(sourceOk && importedOk)
  })
}
export const checkAndImport_transFunc = (path: NodePath, imported: string, source: string) => {
  const programPath = getTopPath(path)
  const flag = hasImported_transFunc(path, imported, source)
  if (!flag) {
    const importList:ImportDeclaration[] = getAllImport(path)
    const hasImported = importList.find(item => {
      const sourceOk= item.source.value === source
      const importedOk = item.specifiers.find((item) => {
        if (item.type === 'ImportSpecifier') {
          if (item.imported && item.imported.type === 'Identifier') {
              return item.imported.name === imported
          }
        }
        return false
      })
      return !!(sourceOk && importedOk)
    })
    // 未曾导入
    if (!hasImported) {
    const importAst = template.ast `import { t } from 'i18next';`
      programPath?.node.body.unshift(importAst as Statement);
    }
  }
}
export const checkAndImport_transFunc_notHook = (path: NodePath) => {
  const programPath = getTopPath(path)
  const hasImported = hasImported_transFunc(path, 't', 'i18next')
  if (!hasImported) {
    // 未曾导入
    const importAst = template.ast `import { t } from 'i18next'`
    programPath?.node.body.unshift(importAst as Statement);
  }
}
export const checkAndImport_transFunc_hook = (path: NodePath) => {
  const programPath = getTopPath(path)
  const hasImported = hasImported_transFunc(path, 'useTranslation', 'react-i18next')
  if (!hasImported) {
    // 未曾导入
    const importAst = template.ast `import { useTranslation } from 'react-i18next'`
    programPath?.node.body.unshift(importAst as Statement);
  }
}

export type TFunctionType = ArrowFunctionExpression | FunctionExpression | FunctionDeclaration

type TCallExpressionArguments = t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
export const getExposeHookNode = () => {
  const id = t.objectPattern([
    t.objectProperty(
      t.identifier('t'),
      t.identifier('t')
    )
  ])
  const init = t.callExpression(t.identifier('useTranslation'), [])
  const variableDeclarator = t.variableDeclarator(id, init);
  return t.variableDeclaration('const', [variableDeclarator])
}
// 函数组件、自定义hook中：检测，暴露t函数 const { t } = useTranslation()
export const checkAndInsert_ExposeHook = (path: NodePath) => {
  const topFuncPath = getTopMostFunctionPath(path)
  if (!topFuncPath) return
  if (isCustomReactHookFunc(topFuncPath) || isReactFuncComp(topFuncPath)) {
    if (hasInsert_ExposeHook(path)) return // 已插入
    // const hooksAst = template.ast`${exposeHookFunc_codeStr}`;
    const hooksAst = template.ast `const {t} = useTranslation();`;  
    let body = null
    if (t.isArrowFunctionExpression(topFuncPath.node)) {
        if (topFuncPath.node.body.type === 'BlockStatement') {
          body = (topFuncPath.node.body as BlockStatement)?.body
        } // else 走stringLiteral逻辑
    } else {
      body = (topFuncPath.node as FunctionExpression | FunctionDeclaration).body?.body
    }
    if (body) {
      hooksAst && body.unshift(hooksAst as Statement)
    }
  }
}
export const hasInsert_ExposeHook = (path: NodePath) => {
  const topFuncPath = getTopMostFunctionPath(path)
  if (!topFuncPath) return true
  if (isCustomReactHookFunc(topFuncPath) || isReactFuncComp(topFuncPath)) {
    let body = null
    if (t.isArrowFunctionExpression(topFuncPath.node)) {
      if (t.isBlockStatement(topFuncPath.node.body)) {
        body = topFuncPath.node.body.body
      }
    } else {
      body = (topFuncPath.node  as FunctionExpression | FunctionDeclaration).body.body
    }
    const str  = generator(template.ast `const {t} = useTranslation()`, {jsescOption: {minimal: true}, compact: true})
    if (body) {
      return body.find((each) => {
        if (t.isVariableDeclaration(each)) {
          const codeStr = generator(each, {jsescOption: {minimal: true}, compact: true})
          return codeStr.code === str.code
        }
        return false
      })
    }
  }
  return false
}

export const isReactFuncComp = (path: NodePath) => {
  const {type, node} = path
  // 函数表达式：常规函数、箭头函数
  if (['ArrowFunctionExpression', 'FunctionExpression'].includes(type)) {
    const {parent} = path
    if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
      const funcName = parent.id.name
      return startWithUpperLetter(funcName)
    }
  } else if (type === 'FunctionDeclaration') {
    // 函数声明
    const funcName = (node as FunctionDeclaration).id?.name
    return funcName && startWithUpperLetter(funcName)
  }
  return false

}
export const isCustomReactHookFunc = (path: NodePath) => {
  const {type, node} = path
  // 函数表达式：常规函数、箭头函数
  if (t.isArrowFunctionExpression(path.node) || t.isFunctionExpression(path.node)) {
    const {parent} = path
    if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
      const funcName = parent.id.name
      return startWithUse(funcName)
    }
  } else if (t.isFunctionDeclaration(path.node)) {
    // 函数声明
    const funcName = (node as FunctionDeclaration).id?.name
    return funcName && startWithUse(funcName)
  }
  return false
}
export const isFunction = (path: NodePath) => {
  return t.isArrowFunctionExpression(path.node) || t.isFunctionExpression(path.node) || t.isFunctionDeclaration(path.node)
}

const getFuncName = (path: NodePath) => {
    const {type, node} = path
    // 函数表达式：常规函数、箭头函数
    if (t.isArrowFunctionExpression(path.node) || t.isFunctionExpression(path.node)) {
      const {parent} = path
      if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        const funcName = parent.id.name
        return funcName
      }
    } else if (t.isFunctionDeclaration(path.node)) {
      // 函数声明
      const funcName = (node as FunctionDeclaration).id?.name
      return funcName
    }
    return undefined
  
}


function startWithUpperLetter(str: string) {
  return /^[A-Z]/.test(str);
}
function startWithUse(str: string) {
  return str.substring(0, 'use'.length) === 'use'
}
export const getKey = (keyMap: Record<string, string>, chinesesStr: string) => {
  return Object.keys(keyMap).find((key: string) => keyMap[key] === chinesesStr)
}
export const writeFileIfNotExists = (directoryPath: string, fileName: string, content: string) => {
  try {
    const stats = fs.statSync(directoryPath);
    // 检查目录是否存在
    if (!stats.isDirectory()) {
      console.log(chalk.green('创建目录：'), directoryPath)
      fs.mkdirSync(directoryPath, { recursive: true }); // 如果不存在，创建目录
    }
    
    const filePath = `${directoryPath}/${fileName}`
    
    // 检查文件是否存在
    if (!stats.isFile()) {
      console.log(chalk.green('写入新文件'), filePath)
      fs.writeFileSync(filePath, content); // 如果不存在，创建并写入文件
    } else {
      console.log(chalk.green('写入文件'), filePath)
      fs.writeFileSync(filePath, content); // 如果存在，写入内容
    }
  } catch (err) {
    console.log(err)
  }
}