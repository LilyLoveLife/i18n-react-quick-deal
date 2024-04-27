#!/usr/bin/env node
 
import babel from '@babel/core'
import t, {TemplateLiteral, ObjectProperty, Expression, TSType } from '@babel/types'
import {
  hasTranslated,
  dealWithImport,
  checkAndInsert_ExposeHook,
  getKey,
  shouldIgnore
} from '../utils.js'

import _traverse from '@babel/traverse'
import fs from 'fs'
import path from 'path';
import _generator from '@babel/generator'

const traverse = babel.traverse 
const generator = (_generator as any).default

// '`注意啦，安全！${name} 是个boy`
const chineseReg = /[^\x00-\xff]/ // 包括全角标点符号 ['注意啦，安全！', '是个']
const fileTypeList = ['.tsx', '.ts']
const FuncName = 't'
const ImportStr = 'import { useTranslation } from "react-i18next"'
const ImportStr_notHooks = 'import { t } from "i18next"'
const exposeHookFunc_codeStr = 'const { t } = useTranslation()'

const includesChinese = (str: string) => {
  return chineseReg.test(str)
}
const getNewContent = (filePath: string, keyMap: Record<string, string>) => {
  const {ast} = babel.transformFileSync(filePath, {
    sourceType: 'module',
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
    ast: true,
  }) || {}
  if (!ast) {
    return
  }
  // 引入 import { useTranslation } from 'react-i18next';
  // const { t } = useTranslation();
  traverse(ast, {
    // Program({node}) {
    //   const importList = node.body.filter((item: { type: string })=> item.type === 'ImportDeclaration') as ImportDeclaration[]

    //   const imported = importList.find(item => {
    //     const source = item.source.value === 'react-i18next' // react-i18next
    //     const importedHooks = item.specifiers.find((item) => {
    //       if (item.type === 'ImportSpecifier') {
    //         //  排除StringLiteral（我也不知道为啥还会有StringLiteral）
    //         //  eliminate type 'StringLiteral'（i don't know why has StringLiteral）
    //         if (item.imported && item.imported.type === 'Identifier') {
    //             return item.imported.name === 'useTranslation'
    //         }
    //       }
    //       return false
    //     })
    //     return source && importedHooks
    //   })
    //   if (!imported) {
    //     const importAst = template.ast `${ImportStr}`
    //     node.body.unshift(importAst as Statement);
    //   }
    // },
    StringLiteral(path) {
      const { node, parentPath } = path
      if (includesChinese(node.value)) {

        if (shouldIgnore(path)) return

        if (hasTranslated(path, 't')) return
        // const parentNode = parentPath?.node
        // const translated = parentNode?.type === 'CallExpression' &&  parentNode?.callee.type === 'Identifier' && parentNode?.callee?.name === FuncName
        // if (translated) {
        //   return
        // }
        // 插入导入语句
        dealWithImport(path)

        // 如果可用hooks，顶层函数插入 const { t } = useTranslation();
        checkAndInsert_ExposeHook(path)

        if (parentPath.isJSXAttribute()) {
          path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(node.value)))
        } else if (t.isBinaryExpression(parentPath.node) || t.isConditionalExpression(parentPath.node)) {
            const quasisItem = t.templateElement(
          {
              raw: node.value,
              cooked: node.value,
          },
          false,
        )
          const quasis = [quasisItem]
          const expressions: TemplateLiteral["expressions"] = []
          path.replaceWith(t.templateLiteral(quasis, expressions))
        }
        else {
          const key = getKey(keyMap,node.value) || node.value
          path.replaceWithSourceString(`${FuncName}('${key}')`)
        }
      }
    },
    JSXText(path) {
      const {node} = path
      if (includesChinese(node.value)) {

        if (shouldIgnore(path)) return

         // 插入导入语句
         dealWithImport(path)
         
        // 如果可用hooks，顶层函数插入 const { t } = useTranslation();
        checkAndInsert_ExposeHook(path)

        // <div>这是一个描述</div>转换成<div>{'这是一个描述'}</div>
        // 从而走StringLiteral
        const replacedValue = node.value.replace(/(^\s+|\s+$)/g, '');
        path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(replacedValue)))
      }
    },
    TemplateLiteral(path) {
      
      if (shouldIgnore(path)) return

      const { expressions, quasis } = path.node
      const hasChinese = quasis.find((each) => {
        const { value: { raw }, tail, } = each
        return includesChinese(raw)
      })
      if (hasChinese) {
        if (shouldIgnore(path)) return

         // 插入导入语句
         dealWithImport(path)

        // 如果可用hooks，顶层函数插入 const { t } = useTranslation();
        checkAndInsert_ExposeHook(path)

        const len = quasis.length
        const word:string[] = []
        const params:string[] = []
        expressions.forEach((expression, index) => {
          if (Object.prototype.hasOwnProperty.call(expression, 'name')) {
            params.push(`{{${(expression as any).name}}}`)
          } else {
            params.push(`{{param${index}}}`)
          }
        })
        quasis.forEach((each, index) => {
          const { value: { raw }, tail, } = each
          word.push(raw)
          if (index < len - 1) {
            word.push(params[index])
           }
        })

        const paramKeys: string[] = []
        expressions.forEach((expression, index) => {
          if (Object.prototype.hasOwnProperty.call(expression, 'name')) {
            paramKeys.push(`${(expression as any).name}`)
          } else {
            paramKeys.push(`params${index}`)
          }
        })
        const callee = t.identifier(FuncName)
        const argumentList = []
        const chineseStr = word.join('')
        const keyForChinese = getKey(keyMap, chineseStr) || chineseStr
        argumentList.push(t.stringLiteral(keyForChinese)) // key
        const properties: ObjectProperty[] = []
        paramKeys.forEach((paramKey, index) => {
          if (paramKey && t.isExpression(expressions[index])) {
            const objectProperty = t.objectProperty(t.stringLiteral(paramKey), expressions[index] as Expression) // 不能是TSType
            properties.push(objectProperty)
          }
        })
        if (properties && properties.length) {
          const objectExpression = t.objectExpression(properties);
          argumentList.push(objectExpression)
        }
        const callExpression = t.callExpression(callee, argumentList.length ? argumentList : [])
        path.replaceWith(callExpression)
      }
    },
  })
  const res = generator(ast, {jsescOption: {minimal: true}})
  return res
}
const dealFile = (filePath: string, keyMap: Record<string, string>) => {
  const fileName = path.basename(filePath);
  const fileName_without_extension = path.parse(filePath).name
  const extension = path.parse(filePath).ext
  const newFileName = `${fileName_without_extension}_translated${extension}`
  
  const parentDir = path.dirname(filePath);
  const newFilePath = path.join(parentDir, newFileName);
  const extend = path.extname(filePath)
  if (fileTypeList.includes(extend)) {
    const newContent = getNewContent(filePath, keyMap)
    // 写入新内容到文件
    fs.writeFile(newFilePath, newContent?.code || '', 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return writeErr
      }
      console.log('文件内容已修改', filePath);
      return true
    });
  }
}
async function readFilesInDirectory(directoryPath: string, keyMap: Record<string, string>) {
  const stats = fs.statSync(directoryPath);
  if (stats.isFile()) {
    dealFile(directoryPath, keyMap)
  } else {
    const files = fs.readdirSync(directoryPath);
 
    for (const childFile of files) {
      const childFilePath = path.join(directoryPath, childFile);
      readFilesInDirectory(childFilePath, keyMap)
    }
  }
}
const replaceChinese = async () => {
    const root = process.cwd();
    const filePath = `${root}/src/test`
    const keyMapFilePath = `${root}/src/locale/keyChineseMap/index.js`
    const module = await import(keyMapFilePath)
    const keyMap = module.keyChineseMap
    readFilesInDirectory(filePath, keyMap)
    
}
replaceChinese()
export default replaceChinese