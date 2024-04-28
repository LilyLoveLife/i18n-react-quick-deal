#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import {writeFileIfNotExists} from '../utils.js'
import t, {  Expression, TSType } from '@babel/types'
import babel from '@babel/core'
const traverse = babel.traverse 
const Reg_Chinese = /[^\x00-\xff]/ // 包括全角标点符号 ['注意啦，安全！', '是个']
const isChinese = (str: string) => {
    return Reg_Chinese.test(str)
}
const FuncName = 't'
const fileTypeList = ['.tsx', '.ts']
const Set_ToTranslate = new Set()


const astTraverse = (filePath: string) => {
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
    traverse(ast, {
      StringLiteral(path) {
        const { node, parentPath } = path  // parentPath是null ???
        if (isChinese(node.value)) {
            const parentNode = parentPath?.node
            const translated = parentNode?.type === 'CallExpression'
              &&  parentNode?.callee.type === 'Identifier'
              && parentNode.callee.name === FuncName
            if (translated) {
                return
            }
            if (Set_ToTranslate.has(node.value)) {
                return
            }
            Set_ToTranslate.add(node.value)
        }
      },
      JSXText(path) {
        const {node} = path
        if (isChinese(node.value)) {
          // 去除空格、换行符、制表符
            const replacedValue = node.value.replace(/(^\s+|\s+$)/g, '');
            if (!Set_ToTranslate.has(replacedValue)) {
                Set_ToTranslate.add(replacedValue)
            }
        }
      },
      TemplateLiteral(path) {
        const { expressions, quasis } = path.node
        const hasChinese = quasis.find((each) => {
          const { value: { raw }, tail, } = each
          return isChinese(raw)
        })
        const len = quasis.length
        const key: string[] = []
        // 抽取中文
      if (hasChinese) {
        quasis.forEach((each, index) => {
          const { value: { raw }, tail, } = each
          key.push(raw)
          if (index < len - 1) {
           const expression: Expression | TSType = expressions[index]
            if (expression.hasOwnProperty('name')) {
              key.push(`{{${(expression as any).name}}}`)
            } else {
              key.push(`{{param${index}}}`)
            }
          }
        })
        const chineseExpression = key.join('') // 你好，{{name}}
        if (!Set_ToTranslate.has(chineseExpression)) {
          Set_ToTranslate.add(chineseExpression)
        }
      }
      },
    })
  }
const dealEachFile = (filePath: string) => {
    // const fileName = path.basename(filePath);
    // const fileName_without_extension = path.parse(filePath).name
    // const extension = path.parse(filePath).ext
    // const newFileName = `${fileName_without_extension}_translated${extension}`
    
    // const parentDir = path.dirname(filePath);
    // const newFilePath = path.join(parentDir, newFileName);
  
    if (fileTypeList.includes(path.extname(filePath))) {
      astTraverse(filePath)
      // 写入新内容到文件
     
    }
}
async function traverseFilesInDirectory(directoryPath: string) {
    const stats = fs.statSync(directoryPath);
    if (stats.isFile()) {
      dealEachFile(directoryPath)
    } else {
      const files = fs.readdirSync(directoryPath);
   
      for (const childFile of files) {
        const childFilePath = path.join(directoryPath, childFile);
        traverseFilesInDirectory(childFilePath)
      }
    }
}
const traverseAllFiles = (filePath: string) => {
    traverseFilesInDirectory(filePath)
}
const writeFile = async (jsonStr_toTraslate: string, directoryPath: string, fileName: string) => {
  writeFileIfNotExists(directoryPath, fileName, jsonStr_toTraslate)
}
const extractChinese = () => {
    const projectRoot = process.cwd()
    let filePath = path.join(projectRoot, './src/test');
    let destinateDirPath = path.join(projectRoot, `./src/locale/chinese/`);
    const source = process.argv.find((arg) => arg.startsWith('--source='))?.split('=')[1];
    const chinesedir = process.argv.find((arg) => arg.startsWith('--chinesedir='))?.split('=')[1];

    if (source) {
      filePath = path.join(`${projectRoot}`, source)
    }
    if (chinesedir) {
      destinateDirPath = path.join(`${projectRoot}`, chinesedir)
    }
    traverseAllFiles(filePath)
    const jsonStr_toTraslate = Array.from(Set_ToTranslate).join('\n')
    const destinateFileName = `${new Date().getTime()}.txt` //每次新文件名
    writeFile(jsonStr_toTraslate, destinateDirPath, destinateFileName)
}
extractChinese()
export default extractChinese

