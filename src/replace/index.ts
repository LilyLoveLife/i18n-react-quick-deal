#!/usr/bin/env node
 
/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import babel from '@babel/core'
// import _template from '@babel/template'
import t, { Statement, ImportDeclaration, TemplateLiteral, BlockStatement, ObjectProperty, Expression, TSType } from '@babel/types' // todo: TSType是什么？？？
import {check_insertImport_withoutHook, check_insertExposeHook, getKey} from '../utils.js'

import _traverse, {Node, NodePath, } from '@babel/traverse'
import fs from 'fs'
// import path from 'node:path'
import path from 'path';

// import generator from '@babel/generator'
import _generator from '@babel/generator'

const traverse = babel.traverse 
// const template = _template.default 
const template = babel.template
const generator = (_generator as any).default
// const generate = CodeGenerator.default

// '`注意啦，安全！${name} 是个boy`
// const chineseReg = /[\u4e00-\u9fa5]+/g // 不包括全角标点符号 ['注意啦', '安全', '是个']
const chineseReg = /[^\x00-\xff]/ // 包括全角标点符号 ['注意啦，安全！', '是个']
const fileTypeList = ['.tsx', '.ts']
const FuncName = 't'
const ImportStr = 'import { useTranslation } from "react-i18next"'
const ImportStr_notHooks = 'import { t } from "i18next"'
const exposeHookFunc_codeStr = 'const { t } = useTranslation()'
// const NotHooksStr = 'const { t } = i18next'



const ToTranslateFilePath = './locale/toTranslated.ts'
const includesChinese = (str: string) => {
  return chineseReg.test(str)
}
const buildCallExpression = (funcName: string, nodeValue: string) => {
  return t.callExpression(t.identifier(funcName), [t.stringLiteral(nodeValue)])
}
const replaceWithJsxExpression = (path: NodePath, funcName: string, nodeValue: string) => {
  path.replaceWith(t.jsxExpressionContainer(t.callExpression(t.identifier(funcName), [t.stringLiteral(nodeValue)])))
}
// const isInConsole = (path: NodePath) => {
//   return path.findParent((p: NodePath) => p.isCallExpression()) && path.parent.callee.object.name === 'console'
// }
let flag_garther = false
const toTranslateSet = new Set()

// const addHook = (programNode) => {
//   programNode.body
// }
const getNewContent = (filePath: string, keyMap: Record<string, string>) => {
  // 一种实现： babel.transformFileSync
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
    Program({node}) {
      const importList = node.body.filter((item: { type: string })=> item.type === 'ImportDeclaration') as ImportDeclaration[]

      const imported = importList.find(item => {
        const source = item.source.value === 'react-i18next' // react-i18next
        const importedHooks = item.specifiers.find((item) => {
          if (item.type === 'ImportSpecifier') {
            //  排除StringLiteral（我也不知道为啥还会有StringLiteral）
            //  eliminate type 'StringLiteral'（i don't know why has StringLiteral）
            if (item.imported && item.imported.type === 'Identifier') {
                return item.imported.name === 'useTranslation'
            }
          }
          return false
        })
        return source && importedHooks
      })
      if (!imported) {
        // const importAst = template.ast`
        //   import { useTranslation } from 'react-i18next'
        // `;
        const importAst = template.ast `${ImportStr}`
        node.body.unshift(importAst as Statement);
        // path.get('body').unshiftContainer(importAst)
      }

      // not hooks
      // const imported_notHooks = importList.find(item => {
      //   const source = item.source.value === 'react-i18next' // react-i18next
      //   const importedHooks = item.specifiers.find((item) => {
      //     if (item.type === 'ImportSpecifier') {
      //       //  排除StringLiteral（我也不知道为啥还会有StringLiteral）
      //       //  eliminate type 'StringLiteral'（i don't know why has StringLiteral）
      //       if (item.imported && item.imported.type === 'Identifier') {
      //           return item.imported.name === 't'
      //       }
      //     }
      //     return false
      //   })
      //   return source && importedHooks
      // })
      // if (!imported_notHooks) {
      //   const importAst = template.ast `${ImportStr_notHooks}`
      //   node.body.unshift(importAst as Statement);
      // }
    },
    StringLiteral(path) {
      const { node, parentPath } = path
      if (includesChinese(node.value)) {
        const parentNode = parentPath?.node
        const translated = parentNode?.type === 'CallExpression' &&  parentNode?.callee.type === 'Identifier' && parentNode?.callee?.name === FuncName
        if (translated) {
          return
        }
        // 不可用hooks，插入'import { t } from "i18next"'
        check_insertImport_withoutHook(path)

        if (parentPath.isJSXAttribute()) {
          path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(node.value)))
          // path.replaceWithSourceString(`{${FuncName}('${node.value}')}`)
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
            // const expressions = [t.Identifier(node.value)]
            // const expressions = [t.stringLiteral(node.value)]
            // path.replaceWith(t.templateLiteral(node))
          path.replaceWith(t.templateLiteral(quasis, expressions))
        }
        else {
          // path.replaceWithSourceString(`${FuncName}('${node.value}')`)
          const key = getKey(keyMap,node.value) || node.value
          path.replaceWithSourceString(`${FuncName}('${key}')`)
        }
      }
    },
    JSXText(path) {
      const {node} = path
      if (includesChinese(node.value)) {
         // 不可用hooks，插入'import { t } from "i18next"'
         check_insertImport_withoutHook(path)
        // <div>这是一个描述</div>转换成<div>{'这是一个描述'}</div>
        // 从而走StringLiteral
        const replacedValue = node.value.replace(/(^\s+|\s+$)/g, '');
        path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(replacedValue)))

        // path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(replacedValue)))
        // 错误处理：path.replaceWithSourceString(`{${FuncName}('${node.value}')}`)
        // jsxText处理后，如果是replaceWithSourceString，会处理成字符串"translate('11今日面试')"
        // 这样有两个问题
        // 1.应该处理成JsxExpressionContainer，而不是StringLiteral
        // 2.错误处理成StringLiteral后，会被StringLiteral这个visitor重复处理，
        //   但是StringLiteral这个visitor中并没有对parentPath为JsxExpressionContainer的case进行排除
        // path.replaceWithSourceString(`{${FuncName}('${node.value}')}`)
        // path.replaceWith(t.jsxExpressionContainer(t.callExpression(t.identifier(FuncName), [t.stringLiteral(node.value)])))
        // replaceWithJsxExpression(path, FuncName, node.value)
      }
    },
    TemplateLiteral(path) {
      const { expressions, quasis } = path.node
      const hasChinese = quasis.find((each) => {
        const { value: { raw }, tail, } = each
        return includesChinese(raw)
      })
      if (hasChinese) {
        // 不可用hooks，插入'import { t } from "i18next"'
        check_insertImport_withoutHook(path)


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
        console.log('--params----', params)
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
          console.log('---paramKey---params[index]-', paramKey, params[index])
          if (paramKey && t.isExpression(expressions[index])) {
            const objectProperty = t.objectProperty(t.stringLiteral(paramKey), expressions[index] as Expression) // 不能是TSType
            // const objectProperty = t.objectProperty(t.stringLiteral(paramKey), expressions[index] as Expression) // 不能是TSType
            properties.push(objectProperty)
          }
          // properties.push(t.objectProperty(t.stringLiteral(key), t.identifier(key)))
        })
        if (properties && properties.length) {
          const objectExpression = t.objectExpression(properties);
          argumentList.push(objectExpression)
        }
        const callExpression = t.callExpression(callee, argumentList.length ? argumentList : [])
        path.replaceWith(callExpression)
      }
          // let countExpressions = 0;
          // quasis.forEach((node: { value: any; tail?: any }, index: number) => {
          //   const { value: { raw }, tail, } = node
          //   if (includesChinese(raw)) {
          //     console.log(raw)
          //     // const newCall = buildCallExpression(FuncName, raw)
          //     const newCall = t.stringLiteral(raw) // 先转成字符串，然后走StringLiteral的visitor
          //     expressions.splice(index + countExpressions, 0, newCall)
          //     countExpressions++
          //     node.value = {
          //       raw: '',
          //       cooked: '',
          //     }
          //     quasis.push(
          //         t.templateElement(
          //           {
          //               raw: '',
          //               cooked: '',
          //           },
          //           false,
          //         ),
          //     );
          //   }
          // })
          // quasis[quasis.length - 1].tail = true;
    },
    ArrowFunctionExpression(path) {
      check_insertExposeHook(path)
    //   const parentFunctionPath = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
      // const isTopFunctionPath = isTopFunction(path)
      // if (isTopFunctionPath) {
      //   const { parent } = path
      //   console.log("找到最外层的函数:", path.node) // , path.node.argument
      //   const hooksAst = template.ast`${exposeHookFunc_codeStr}` as Statement
      //   const body = path.node.body
      //   if (body.type === 'BlockStatement') {
      //       (path.node.body as BlockStatement)?.body?.unshift(hooksAst)
      //   }
        // 其他：type是Expression（BinaryExpression）  走StringLiteral
        // type Expression = ArrayExpression | AssignmentExpression | BinaryExpression | CallExpression | ConditionalExpression | FunctionExpression | Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | RegExpLiteral | LogicalExpression | MemberExpression ....
        // 例如：const func = () => true ? 1 : 2
      // }
    },
    FunctionExpression(path) {
      check_insertExposeHook(path)
      // const isTopFunctionPath = isTopFunction(path)
      // if (!isTopFunctionPath) {
      //   const { parent } = path
      //   // console.log("找到最外层的函数:", path.node) // , path.node.argument
      //   const hooksAst = template.ast`${exposeHookFunc_codeStr}`
      //   path.node.body.body.unshift(hooksAst as Statement)
      // }
    },
    FunctionDeclaration(path) {
      check_insertExposeHook(path)
      // const isTopFunctionPath = isTopFunction(path)
      // if (!isTopFunctionPath) {
      //   const { parent } = path
      //   const hooksAst = template.ast`${exposeHookFunc_codeStr}`
      //   path.node.body.body.unshift(hooksAst as Statement)
      // }
    },
  })
  // traverse(ast, {
  //   ImportDeclaration(path) {
  //     const importSpecifiersMap = new Map();
  //     const source = path.node.source.value;
  //     const specifiers = importSpecifiersMap.get(source) || [];
 
  //     path.node.specifiers.forEach(specifier => {
  //       const existingSpecifier = specifiers.find((s:any)=> {
  //         console.log('----importFrom -----', s.local.name)
  //         return t.isImportSpecifier(specifier) && s.local.name === specifier.local.name}
  //       );
  //       if (!existingSpecifier) {
  //         specifiers.push(specifier);
  //       }
  //     });
 
  //     importSpecifiersMap.set(source, specifiers);
 
  //     if (specifiers.length === 0) {
  //       path.remove();
  //     } else {
  //       path.node.specifiers = specifiers;
  //     }
  //   }
  // })
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
    // const Flag_canHooks = ['.tsx'].includes(extend)
    const newContent = getNewContent(filePath, keyMap)
    // 写入新内容到文件
    fs.writeFile(newFilePath, newContent?.code || '', 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return writeErr
      }
      console.log('文件内容已修改。');
      return true
    });
  }
}
async function readFilesInDirectory(directoryPath: string, keyMap: Record<string, string>) {
  const stats = fs.statSync(directoryPath);
  if (stats.isFile()) {
    console.log('是一个文件');
    dealFile(directoryPath, keyMap)
  } else {
    console.log('是一个目录');
    const files = fs.readdirSync(directoryPath);
 
    for (const childFile of files) {
      const childFilePath = path.join(directoryPath, childFile);
      readFilesInDirectory(childFilePath, keyMap)
    }
  }
}

// const dirPath = path.join(__dirname, 'src/test/index.tsx');
// const dirPath = path.join(__dirname, 'src/test');

// const file = path.join(__dirname, 'src/test/index.tsx');
// const result = getNewContent(file)
const replaceChinese = async () => {
    const root = process.cwd();
    const filePath = `${root}/src/test` // /index.tsx
    const keyMapFilePath = `${root}/src/locale/keyChineseMap/index.js`
    const module = await import(keyMapFilePath)
      const keyMap = module.keyChineseMap
      console.log('----keyMap-----', keyMap)
      readFilesInDirectory(filePath, keyMap)
    
}
replaceChinese() // test
export default replaceChinese