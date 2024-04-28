#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import babel from '@babel/core';
import t from '@babel/types';
import chalk from 'chalk';
import { hasTranslated, dealWithImport, checkAndInsert_ExposeHook, getKey, shouldIgnore } from '../utils.js';
import fs from 'fs';
import path from 'path';
import _generator from '@babel/generator';
const traverse = babel.traverse;
const generator = _generator.default;
// '`注意啦，安全！${name} 是个boy`
const chineseReg = /[^\x00-\xff]/; // 包括全角标点符号 ['注意啦，安全！', '是个']
const fileTypeList = ['.tsx', '.ts'];
const FuncName = 't';
const ImportStr = 'import { useTranslation } from "react-i18next"';
const ImportStr_notHooks = 'import { t } from "i18next"';
const exposeHookFunc_codeStr = 'const { t } = useTranslation()';
const includesChinese = (str) => {
    return chineseReg.test(str);
};
const getNewContent = (filePath, keyMap) => {
    const { ast } = babel.transformFileSync(filePath, {
        sourceType: 'module',
        parserOpts: {
            plugins: ['jsx', 'typescript'],
        },
        ast: true,
    }) || {};
    if (!ast) {
        return;
    }
    traverse(ast, {
        StringLiteral(path) {
            const { node, parentPath } = path;
            if (includesChinese(node.value)) {
                if (shouldIgnore(path))
                    return;
                if (hasTranslated(path, 't'))
                    return;
                // 插入导入语句
                dealWithImport(path);
                // 如果可用hooks，顶层函数插入 const { t } = useTranslation();
                checkAndInsert_ExposeHook(path);
                if (parentPath.isJSXAttribute()) {
                    path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(node.value)));
                }
                else if (t.isBinaryExpression(parentPath.node) || t.isConditionalExpression(parentPath.node)) {
                    const quasisItem = t.templateElement({
                        raw: node.value,
                        cooked: node.value,
                    }, false);
                    const quasis = [quasisItem];
                    const expressions = [];
                    path.replaceWith(t.templateLiteral(quasis, expressions));
                }
                else {
                    const key = getKey(keyMap, node.value) || node.value;
                    path.replaceWithSourceString(`${FuncName}('${key}')`);
                }
            }
        },
        JSXText(path) {
            const { node } = path;
            if (includesChinese(node.value)) {
                if (shouldIgnore(path))
                    return;
                // 插入导入语句
                dealWithImport(path);
                // 如果可用hooks，顶层函数插入 const { t } = useTranslation();
                checkAndInsert_ExposeHook(path);
                // <div>这是一个描述</div>转换成<div>{'这是一个描述'}</div>
                // 从而走StringLiteral
                const replacedValue = node.value.replace(/(^\s+|\s+$)/g, '');
                path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(replacedValue)));
            }
        },
        TemplateLiteral(path) {
            if (shouldIgnore(path))
                return;
            const { expressions, quasis } = path.node;
            const hasChinese = quasis.find((each) => {
                const { value: { raw }, tail, } = each;
                return includesChinese(raw);
            });
            if (hasChinese) {
                if (shouldIgnore(path))
                    return;
                // 插入导入语句
                dealWithImport(path);
                // 如果可用hooks，顶层函数插入 const { t } = useTranslation();
                checkAndInsert_ExposeHook(path);
                const len = quasis.length;
                const word = [];
                const params = [];
                expressions.forEach((expression, index) => {
                    if (Object.prototype.hasOwnProperty.call(expression, 'name')) {
                        params.push(`{{${expression.name}}}`);
                    }
                    else {
                        params.push(`{{param${index}}}`);
                    }
                });
                quasis.forEach((each, index) => {
                    const { value: { raw }, tail, } = each;
                    word.push(raw);
                    if (index < len - 1) {
                        word.push(params[index]);
                    }
                });
                const paramKeys = [];
                expressions.forEach((expression, index) => {
                    if (Object.prototype.hasOwnProperty.call(expression, 'name')) {
                        paramKeys.push(`${expression.name}`);
                    }
                    else {
                        paramKeys.push(`params${index}`);
                    }
                });
                const callee = t.identifier(FuncName);
                const argumentList = [];
                const chineseStr = word.join('');
                const keyForChinese = getKey(keyMap, chineseStr) || chineseStr;
                argumentList.push(t.stringLiteral(keyForChinese)); // key
                const properties = [];
                paramKeys.forEach((paramKey, index) => {
                    if (paramKey && t.isExpression(expressions[index])) {
                        const objectProperty = t.objectProperty(t.stringLiteral(paramKey), expressions[index]); // 不能是TSType
                        properties.push(objectProperty);
                    }
                });
                if (properties && properties.length) {
                    const objectExpression = t.objectExpression(properties);
                    argumentList.push(objectExpression);
                }
                const callExpression = t.callExpression(callee, argumentList.length ? argumentList : []);
                path.replaceWith(callExpression);
            }
        },
    });
    const res = generator(ast, { jsescOption: { minimal: true } });
    return res;
};
const dealFile = (filePath, keyMap) => {
    const fileName = path.basename(filePath);
    const fileName_without_extension = path.parse(filePath).name;
    const extension = path.parse(filePath).ext;
    const newFileName = `${fileName_without_extension}_translated_${new Date().getTime()}${extension}`;
    const parentDir = path.dirname(filePath);
    const newFilePath = path.join(parentDir, newFileName);
    const extend = path.extname(filePath);
    if (fileTypeList.includes(extend)) {
        const newContent = getNewContent(filePath, keyMap);
        // 写入新内容到文件
        fs.writeFile(newFilePath, (newContent === null || newContent === void 0 ? void 0 : newContent.code) || '', 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return writeErr;
            }
            console.log(chalk.green('已翻译'), filePath);
            console.log(chalk.green('新文件'), newFilePath);
            return true;
        });
    }
};
function readFilesInDirectory(directoryPath, keyMap) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stats = fs.statSync(directoryPath);
            if (stats.isFile()) {
                if (directoryPath.includes('_translated_')) {
                    return;
                }
                dealFile(directoryPath, keyMap);
            }
            else if (stats.isDirectory()) {
                const files = fs.readdirSync(directoryPath);
                for (const childFile of files) {
                    const childFilePath = path.join(directoryPath, childFile);
                    readFilesInDirectory(childFilePath, keyMap);
                }
            }
            else {
                console.log(chalk.red('文件或目录不存在！'), directoryPath);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
const replaceChinese = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const root = process.cwd();
    const source = (_a = process.argv.find((arg) => arg.startsWith('--source='))) === null || _a === void 0 ? void 0 : _a.split('=')[1];
    const keymap = (_b = process.argv.find((arg) => arg.startsWith('--keymap='))) === null || _b === void 0 ? void 0 : _b.split('=')[1];
    let filePath = `${root}/src`;
    if (source) {
        filePath = path.join(`${root}`, source);
    }
    let keyMapFilePath = `${root}/src/locale/keyMap/index.js`;
    if (keymap) {
        keyMapFilePath = path.join(`${root}`, keymap);
    }
    const module = yield import(keyMapFilePath);
    const keyMap = module.keyChineseMap;
    readFilesInDirectory(filePath, keyMap);
});
replaceChinese();
export default replaceChinese;
