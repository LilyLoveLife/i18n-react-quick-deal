/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import babel from '@babel/core'
import template from '@babel/template'
import t, { Statement, ImportDeclaration, TemplateLiteral, BlockStatement, V8IntrinsicIdentifier } from '@babel/types' //GeneratorResult , StringLiteral
import {validTopFunctionPath} from '../utils'

import traverse, {Node, NodePath, } from '@babel/traverse'
import fs from 'fs'
// import path from 'node:path'
import path from 'path';

import generator from '@babel/generator'

// '`注意啦，安全！${name} 是个boy`
// const chineseReg = /[\u4e00-\u9fa5]+/g // 不包括全角标点符号 ['注意啦', '安全', '是个']
const chineseReg = /[^\x00-\xff]/ // 包括全角标点符号 ['注意啦，安全！', '是个']
const fileTypeList = ['.tsx', '.ts']
const FuncName = 't'
const ImportStr = `import { useTranslation } from 'react-i18next'`
const HooksStr = `const { t } = useTranslation()`

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
const getNewContent = (filePath: string) => {
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
    },
    StringLiteral(path) {
      const { node, parentPath } = path
      if (includesChinese(node.value)) {
        const parentNode = parentPath?.node
        const translated = parentNode?.type === 'CallExpression' &&  parentNode?.callee.type === 'Identifier' && parentNode?.callee?.name === FuncName
        if (translated) {
          return
        }

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
          path.replaceWithSourceString(`${FuncName}('${node.value}')`)
        }
      }
    },
    JSXText(path) {
      const {node} = path
      if (includesChinese(node.value)) {
        path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(node.value)))
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
          let countExpressions = 0;
          quasis.forEach((node: { value: any; tail?: any }, index: number) => {
            const { value: { raw }, tail, } = node
            if (includesChinese(raw)) {
              console.log(raw)
              // const newCall = buildCallExpression(FuncName, raw)
              const newCall = t.stringLiteral(raw) // 先转成字符串，然后走StringLiteral的visitor
              expressions.splice(index + countExpressions, 0, newCall)
              countExpressions++
              node.value = {
                raw: '',
                cooked: '',
              }
              quasis.push(
                  t.templateElement(
                    {
                        raw: '',
                        cooked: '',
                    },
                    false,
                  ),
              );
            }
          })
          quasis[quasis.length - 1].tail = true;
    },
    ArrowFunctionExpression(path) {
    //   const parentFunctionPath = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
      const isTopFunctionPath = validTopFunctionPath(path)
      if (isTopFunctionPath) {
        const { parent } = path
        console.log("找到最外层的函数:", path.node) // , path.node.argument
        const hooksAst = template.ast`${HooksStr}` as Statement
        const body = path.node.body
        if (body.type === 'BlockStatement') {
            (path.node.body as BlockStatement)?.body?.unshift(hooksAst)
        }
        // 其他：type是Expression（BinaryExpression）  走StringLiteral
        // type Expression = ArrayExpression | AssignmentExpression | BinaryExpression | CallExpression | ConditionalExpression | FunctionExpression | Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | RegExpLiteral | LogicalExpression | MemberExpression ....
      }
    },
    FunctionExpression(path) {
    //   const parentFunctionPath = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
      const isTopFunctionPath = validTopFunctionPath(path)
      if (!isTopFunctionPath) {
        const { parent } = path
        // console.log("找到最外层的函数:", path.node) // , path.node.argument
        const hooksAst = template.ast`${HooksStr}`
        path.node.body.body.unshift(hooksAst as Statement)
      }
    },
    // ReturnStatement(path) {
    //   const parentFunctionPath = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
    //   if (parentFunctionPath === path.getFunctionParent()) {
    //     console.log("找到最外层的 return:") // , path.node.argument
    //     const { parent } = path
    //     const hooksAst = template.ast`${HooksStr}`
    //     parent.body.unshift(hooksAst)
    //   }

    //   // const { parent } = path
    //   // const { body } = parent
    //   // const hooksAst = template.ast `${HooksStr}`
    //   // body.unshift(hooksAst)
    //   // todo ?????? 
    //   // body.unshift(
    //   //   babelParser.parse('const { t } = useTranslation()').program.body[0],
    //   // );
    // }
  })
  const res = generator(ast)
  return res
}
const dealFile = (filePath: string) => {
  const fileName = path.basename(filePath);
  const fileName_without_extension = path.parse(filePath).name
  const extension = path.parse(filePath).ext
  const newFileName = `${fileName_without_extension}_translated${extension}`
  
  const parentDir = path.dirname(filePath);
  const newFilePath = path.join(parentDir, newFileName);

  if (fileTypeList.includes(path.extname(filePath))) {
    const newContent = getNewContent(filePath)
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
async function readFilesInDirectory(directoryPath: string) {
  const stats = fs.statSync(directoryPath);
  if (stats.isFile()) {
    console.log('是一个文件');
    dealFile(directoryPath)
  } else {
    console.log('是一个目录');
    const files = fs.readdirSync(directoryPath);
 
    for (const childFile of files) {
      const childFilePath = path.join(directoryPath, childFile);
      readFilesInDirectory(childFilePath)
    }
  }
}

// const dirPath = path.join(__dirname, 'src/test/index.tsx');
// const dirPath = path.join(__dirname, 'src/test');

// const file = path.join(__dirname, 'src/test/index.tsx');
// const result = getNewContent(file)
const replaceChinese = () => {
    const root = process.cwd();
    const filePath = `${root}/src`
    readFilesInDirectory(filePath)
}
export default replaceChinese