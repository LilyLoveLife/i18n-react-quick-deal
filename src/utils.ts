import { NodePath } from "@babel/core"
import t, { Program, ImportDeclaration} from '@babel/types' //GeneratorResult , StringLiteral
import babel from '@babel/core'
import fs from 'fs'
import path from 'path'
import {Statement} from '@babel/types'
const template = babel.template
const ImportStr_notHooks = 'import i18next from "i18next"'
const NotHooksStr = 'const { t } = i18next'

// path本身是一个函数节点
export const validTopFunctionPath = (path: NodePath) => {
   return ( path.isArrowFunctionExpression() || path.isFunctionExpression())
          && !path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
}
// path本身可以是任意类型节点
export const isInFunction = (path: NodePath) => {
  return path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
}
export const getTopPath = (path: NodePath) => {
  const programPath = path.findParent(p => p.isProgram()) as NodePath<Program>
  return programPath
}
// export const importWithoutHooks = (path:NodePath ) => {
//   if (!isInFunction(path)) {
//     const programPath = getTopPath(path)
//     const importAst = template.ast `${ImportStr_notHooks}`
//     programPath?.node.body.unshift(importAst as Statement);
//     // programPath?.node.body.push(importAst as Statement);
//   }
// }
export const getAllImport = (path: NodePath) => {
  const programPath = getTopPath(path)
  const importList = programPath?.node.body.filter((item: { type: string })=> item.type === 'ImportDeclaration') as ImportDeclaration[]
  return importList
}
export const hasImported_TFuncOfI18next =  (path: NodePath) => {
  const importList:ImportDeclaration[] = getAllImport(path)
  return !!importList.find(item => {
    const source = item.source.value === 'i18next'
    const importedHooks = item.specifiers.find((item) => {
      if (item.type === 'ImportSpecifier') {
        if (item.imported && item.imported.type === 'Identifier') {
            return item.imported.name === 't'
        }
      }
      return false
    })
    return !!(source && importedHooks)
  })
}
export const checkAndImport_TFuncOfI18next = (path: NodePath) => {
  const programPath = getTopPath(path)
  const flag = hasImported_TFuncOfI18next(path)
  if (!flag) {
    const importAst = template.ast `${ImportStr_notHooks}`
    programPath?.node.body.unshift(importAst as Statement);
  }
}

export const writeFileIfNotExists = (directoryPath: string, fileName: string, content: string) => {
   // 检查目录是否存在
   if (!fs.existsSync(directoryPath)) {
     fs.mkdirSync(directoryPath, { recursive: true }); // 如果不存在，创建目录
   }
  
   const filePath = `${directoryPath}/${fileName}`
  
   // 检查文件是否存在
   if (!fs.existsSync(filePath)) {
     fs.writeFileSync(filePath, content); // 如果不存在，创建并写入文件
   } else {
     fs.writeFileSync(filePath, content); // 如果存在，写入内容
   }
}