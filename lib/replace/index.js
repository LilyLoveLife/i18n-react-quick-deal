var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import babel from '@babel/core';
import template from '@babel/template';
import t from '@babel/types'; //GeneratorResult , StringLiteral
import { validTopFunctionPath } from '../utils';
import traverse from '@babel/traverse';
import fs from 'fs';
// import path from 'node:path'
import path from 'path';
import generator from '@babel/generator';
// '`注意啦，安全！${name} 是个boy`
// const chineseReg = /[\u4e00-\u9fa5]+/g // 不包括全角标点符号 ['注意啦', '安全', '是个']
var chineseReg = /[^\x00-\xff]/; // 包括全角标点符号 ['注意啦，安全！', '是个']
var fileTypeList = ['.tsx', '.ts'];
var FuncName = 't';
var ImportStr = "import { useTranslation } from 'react-i18next'";
var HooksStr = "const { t } = useTranslation()";
var ToTranslateFilePath = './locale/toTranslated.ts';
var includesChinese = function (str) {
    return chineseReg.test(str);
};
var buildCallExpression = function (funcName, nodeValue) {
    return t.callExpression(t.identifier(funcName), [t.stringLiteral(nodeValue)]);
};
var replaceWithJsxExpression = function (path, funcName, nodeValue) {
    path.replaceWith(t.jsxExpressionContainer(t.callExpression(t.identifier(funcName), [t.stringLiteral(nodeValue)])));
};
// const isInConsole = (path: NodePath) => {
//   return path.findParent((p: NodePath) => p.isCallExpression()) && path.parent.callee.object.name === 'console'
// }
var flag_garther = false;
var toTranslateSet = new Set();
// const addHook = (programNode) => {
//   programNode.body
// }
var getNewContent = function (filePath) {
    // 一种实现： babel.transformFileSync
    var ast = (babel.transformFileSync(filePath, {
        sourceType: 'module',
        parserOpts: {
            plugins: ['jsx', 'typescript'],
        },
        ast: true,
    }) || {}).ast;
    if (!ast) {
        return;
    }
    // 引入 import { useTranslation } from 'react-i18next';
    // const { t } = useTranslation();
    traverse(ast, {
        Program: function (_a) {
            var node = _a.node;
            var importList = node.body.filter(function (item) { return item.type === 'ImportDeclaration'; });
            var imported = importList.find(function (item) {
                var source = item.source.value === 'react-i18next'; // react-i18next
                var importedHooks = item.specifiers.find(function (item) {
                    if (item.type === 'ImportSpecifier') {
                        //  排除StringLiteral（我也不知道为啥还会有StringLiteral）
                        //  eliminate type 'StringLiteral'（i don't know why has StringLiteral）
                        if (item.imported && item.imported.type === 'Identifier') {
                            return item.imported.name === 'useTranslation';
                        }
                    }
                    return false;
                });
                return source && importedHooks;
            });
            if (!imported) {
                // const importAst = template.ast`
                //   import { useTranslation } from 'react-i18next'
                // `;
                var importAst = template.ast(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), ImportStr);
                node.body.unshift(importAst);
                // path.get('body').unshiftContainer(importAst)
            }
        },
        StringLiteral: function (path) {
            var _a;
            var node = path.node, parentPath = path.parentPath;
            if (includesChinese(node.value)) {
                var parentNode = parentPath === null || parentPath === void 0 ? void 0 : parentPath.node;
                var translated = (parentNode === null || parentNode === void 0 ? void 0 : parentNode.type) === 'CallExpression' && (parentNode === null || parentNode === void 0 ? void 0 : parentNode.callee.type) === 'Identifier' && ((_a = parentNode === null || parentNode === void 0 ? void 0 : parentNode.callee) === null || _a === void 0 ? void 0 : _a.name) === FuncName;
                if (translated) {
                    return;
                }
                if (parentPath.isJSXAttribute()) {
                    path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(node.value)));
                    // path.replaceWithSourceString(`{${FuncName}('${node.value}')}`)
                }
                else if (t.isBinaryExpression(parentPath.node) || t.isConditionalExpression(parentPath.node)) {
                    var quasisItem = t.templateElement({
                        raw: node.value,
                        cooked: node.value,
                    }, false);
                    var quasis = [quasisItem];
                    var expressions = [];
                    // const expressions = [t.Identifier(node.value)]
                    // const expressions = [t.stringLiteral(node.value)]
                    // path.replaceWith(t.templateLiteral(node))
                    path.replaceWith(t.templateLiteral(quasis, expressions));
                }
                else {
                    path.replaceWithSourceString(FuncName + "('" + node.value + "')");
                }
            }
        },
        JSXText: function (path) {
            var node = path.node;
            if (includesChinese(node.value)) {
                path.replaceWith(t.jSXExpressionContainer(t.stringLiteral(node.value)));
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
        TemplateLiteral: function (path) {
            var _a = path.node, expressions = _a.expressions, quasis = _a.quasis;
            var countExpressions = 0;
            quasis.forEach(function (node, index) {
                var raw = node.value.raw, tail = node.tail;
                if (includesChinese(raw)) {
                    console.log(raw);
                    // const newCall = buildCallExpression(FuncName, raw)
                    var newCall = t.stringLiteral(raw); // 先转成字符串，然后走StringLiteral的visitor
                    expressions.splice(index + countExpressions, 0, newCall);
                    countExpressions++;
                    node.value = {
                        raw: '',
                        cooked: '',
                    };
                    quasis.push(t.templateElement({
                        raw: '',
                        cooked: '',
                    }, false));
                }
            });
            quasis[quasis.length - 1].tail = true;
        },
        ArrowFunctionExpression: function (path) {
            var _a, _b;
            //   const parentFunctionPath = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
            var isTopFunctionPath = validTopFunctionPath(path);
            if (isTopFunctionPath) {
                var parent_1 = path.parent;
                console.log("找到最外层的函数:", path.node); // , path.node.argument
                var hooksAst = template.ast(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", ""], ["", ""])), HooksStr);
                var body = path.node.body;
                if (body.type === 'BlockStatement') {
                    (_b = (_a = path.node.body) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.unshift(hooksAst);
                }
                // 其他：type是Expression（BinaryExpression）  走StringLiteral
                // type Expression = ArrayExpression | AssignmentExpression | BinaryExpression | CallExpression | ConditionalExpression | FunctionExpression | Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | RegExpLiteral | LogicalExpression | MemberExpression ....
            }
        },
        FunctionExpression: function (path) {
            //   const parentFunctionPath = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression())
            var isTopFunctionPath = validTopFunctionPath(path);
            if (!isTopFunctionPath) {
                var parent_2 = path.parent;
                // console.log("找到最外层的函数:", path.node) // , path.node.argument
                var hooksAst = template.ast(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", ""], ["", ""])), HooksStr);
                path.node.body.body.unshift(hooksAst);
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
    });
    var res = generator(ast);
    return res;
};
var dealFile = function (filePath) {
    var fileName = path.basename(filePath);
    var fileName_without_extension = path.parse(filePath).name;
    var extension = path.parse(filePath).ext;
    var newFileName = fileName_without_extension + "_translated" + extension;
    var parentDir = path.dirname(filePath);
    var newFilePath = path.join(parentDir, newFileName);
    if (fileTypeList.includes(path.extname(filePath))) {
        var newContent = getNewContent(filePath);
        // 写入新内容到文件
        fs.writeFile(newFilePath, (newContent === null || newContent === void 0 ? void 0 : newContent.code) || '', 'utf8', function (writeErr) {
            if (writeErr) {
                console.error(writeErr);
                return writeErr;
            }
            console.log('文件内容已修改。');
            return true;
        });
    }
};
function readFilesInDirectory(directoryPath) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, files, _i, files_1, childFile, childFilePath;
        return __generator(this, function (_a) {
            stats = fs.statSync(directoryPath);
            if (stats.isFile()) {
                console.log('是一个文件');
                dealFile(directoryPath);
            }
            else {
                console.log('是一个目录');
                files = fs.readdirSync(directoryPath);
                for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                    childFile = files_1[_i];
                    childFilePath = path.join(directoryPath, childFile);
                    readFilesInDirectory(childFilePath);
                }
            }
            return [2 /*return*/];
        });
    });
}
// const dirPath = path.join(__dirname, 'src/test/index.tsx');
// const dirPath = path.join(__dirname, 'src/test');
// const file = path.join(__dirname, 'src/test/index.tsx');
// const result = getNewContent(file)
var replaceChinese = function () {
    var root = process.cwd();
    var filePath = root + "/src";
    readFilesInDirectory(filePath);
};
export default replaceChinese;
var templateObject_1, templateObject_2, templateObject_3;
