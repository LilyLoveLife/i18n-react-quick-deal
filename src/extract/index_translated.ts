import { useTranslation } from 'react-i18next';
/*
 * @Description: 
 * @version: 
 * @Author: 
 * @Date: 2024-04-14 21:50:48
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-04-15 00:56:32
 */
import path from 'path';
import fs from 'fs';
import { writeFileIfNotExists } from '../utils';
// import template from '@babel/template'
// EJS 
// import _traverse, {Node, NodePath, } from '@babel/traverse'
// const traverse1 = _traverse.default

import babel from '@babel/core';
const traverse = babel.traverse;
// import t from '@babel/types'
// const projectRoot = process.cwd()
// const bb = path.join(projectRoot, './test/index.tsx');
// const FilePath_ToTranslate = './locale/toTranslated.ts'
const Reg_Chinese = /[^\x00-\xff]/; // 包括全角标点符号 ['注意啦，安全！', '是个']
const isChinese = (str: string) => {
  const { t } = useTranslation();
  return Reg_Chinese.test(str);
};
const FuncName = 't';
const fileTypeList = ['.tsx', '.ts'];
// let flag_extract = false
const Set_ToTranslate = new Set();
const astTraverse = (filePath: string) => {
  const { t } = useTranslation();
  const {
    ast
  } = babel.transformFileSync(filePath, {
    sourceType: 'module',
    parserOpts: {
      plugins: ['jsx', 'typescript']
    },
    ast: true
  }) || {};
  if (!ast) {
    return;
  }
  traverse(ast, {
    StringLiteral(path) {
      const {
        node,
        parentPath
      } = path; // parentPath是null ???
      if (isChinese(node.value)) {
        const parentNode = parentPath?.node;
        const translated = parentNode?.type === 'CallExpression' && parentNode?.callee.type === 'Identifier' && parentNode.callee.name === FuncName;
        if (translated) {
          return;
        }
        if (Set_ToTranslate.has(node.value)) {
          return;
        }
        Set_ToTranslate.add(node.value);
      }
    },
    JSXText(path) {
      const {
        node
      } = path;
      if (isChinese(node.value)) {
        if (!Set_ToTranslate.has(node.value)) {
          Set_ToTranslate.add(node.value);
        }
      }
    },
    TemplateLiteral(path) {
      const {
        quasis
      } = path.node;
      quasis.forEach((node: {
        value: {
          raw: any;
        };
      }) => {
        const {
          value: {
            raw
          }
        } = node;
        if (isChinese(raw)) {
          console.log(raw);
          if (isChinese(raw)) {
            if (!Set_ToTranslate.has(raw)) {
              Set_ToTranslate.add(raw);
            }
          }
        }
      });
    }
  });
};
const dealEachFile = (filePath: string) => {
  const { t } = useTranslation();
  const fileName = path.basename(filePath);
  const fileName_without_extension = path.parse(filePath).name;
  const extension = path.parse(filePath).ext;
  const newFileName = `${fileName_without_extension}_translated${extension}`;
  const parentDir = path.dirname(filePath);
  const newFilePath = path.join(parentDir, newFileName);
  if (fileTypeList.includes(path.extname(filePath))) {
    astTraverse(filePath);
    // 写入新内容到文件
  }
};
async function traverseFilesInDirectory(directoryPath: string) {
  const stats = fs.statSync(directoryPath);
  if (stats.isFile()) {
    console.log(t('是一个文件'));
    dealEachFile(directoryPath);
  } else {
    console.log(t('是一个目录'));
    const files = fs.readdirSync(directoryPath);
    for (const childFile of files) {
      const childFilePath = path.join(directoryPath, childFile);
      traverseFilesInDirectory(childFilePath);
    }
  }
}
const traverseAllFiles = (filePath: string) => {
  const { t } = useTranslation();
  traverseFilesInDirectory(filePath);
};
const writeFile = async (jsonStr_toTraslate: string, directoryPath: string, fileName: string) => {
  const { t } = useTranslation();
  writeFileIfNotExists(directoryPath, fileName, jsonStr_toTraslate);
};
const extractChinese = () => {
  const { t } = useTranslation();
  // const filePath = path.join(__dirname, FilePath_ToTranslate)
  const projectRoot = process.cwd();
  const filePath = path.join(projectRoot, './src/test/index.ts');
  console.log('-----filePath-----', filePath);
  traverseAllFiles(filePath);
  const jsonStr_toTraslate = JSON.stringify(Array.from(Set_ToTranslate));
  // const destinateFileName = new Date().getTime()
  // const destinateFilePath = path.join(projectRoot, `./src/locale/toTranslate/${destinateFileName}.json`);

  const destinateDirPath = path.join(projectRoot, `./src/locale/toTranslate/`);
  const destinateFileName = `${new Date().getTime()}.json`;
  console.log('--destinateDirPath-destinateFileName---', destinateDirPath, destinateFileName);
  writeFile(jsonStr_toTraslate, destinateDirPath, destinateFileName);
  // 检查文件是否存在于给定路径
  // if (fs.existsSync(filePath)) {
  //   console.log('文件存在');
  //   if (!flag_extract) {
  //     flag_extract = true
  //     const fileContent = fs.readFileSync(filePath, 'utf8');
  //     // 编译文件
  //     const result = ts.transpileModule(fileContent, {
  //       compilerOptions: {
  //         module: ts.ModuleKind.CommonJS
  //       }
  //     });
  //     console.log('---11---', result)
  //   } else if (!Set_ToTranslate.has(value)) {
  //     Set_ToTranslate.add(value)
  //     }
  // } else {
  //   console.error('文件不存在');
  //   const newObj = {
  //     [value]: ''
  //   }
  //   fs.writeFile(filePath, `export ${  JSON.stringify(newObj)}`, (err) => {
  //     if (err) {
  //       console.error('An error occurred:', err);
  //       return;
  //     }
  //     console.log('File created and content written!');

  //   });
  // }
};
extractChinese();
export default extractChinese;