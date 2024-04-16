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
import babel from '@babel/core';
// const traverse1 = _traverse.default
var traverse = babel.traverse;
// import t from '@babel/types'
// const projectRoot = process.cwd()
// const bb = path.join(projectRoot, './test/index.tsx');
// const FilePath_ToTranslate = './locale/toTranslated.ts'
var Reg_Chinese = /[^\x00-\xff]/; // 包括全角标点符号 ['注意啦，安全！', '是个']
var isChinese = function (str) {
    return Reg_Chinese.test(str);
};
var FuncName = 't';
var fileTypeList = ['.tsx', '.ts'];
// let flag_extract = false
var Set_ToTranslate = new Set();
var astTraverse = function (filePath) {
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
    traverse(ast, {
        StringLiteral: function (path) {
            var _a;
            var node = path.node, parentPath = path.parentPath;
            if (isChinese(node.value)) {
                var translated = ((_a = parentPath === null || parentPath === void 0 ? void 0 : parentPath.node) === null || _a === void 0 ? void 0 : _a.type) === 'CallExpression' && parentPath.node.callee.name === FuncName;
                if (translated) {
                    return;
                }
                if (Set_ToTranslate.has(node.value)) {
                    return;
                }
                Set_ToTranslate.add(node.value);
            }
        },
        JSXText: function (path) {
            var node = path.node;
            if (isChinese(node.value)) {
                if (!Set_ToTranslate.has(node.value)) {
                    Set_ToTranslate.add(node.value);
                }
            }
        },
        TemplateLiteral: function (path) {
            var quasis = path.node.quasis;
            quasis.forEach(function (node) {
                var raw = node.value.raw;
                if (isChinese(raw)) {
                    console.log(raw);
                    if (isChinese(raw)) {
                        if (!Set_ToTranslate.has(raw)) {
                            Set_ToTranslate.add(raw);
                        }
                    }
                }
            });
        },
    });
};
var dealEachFile = function (filePath) {
    var fileName = path.basename(filePath);
    var fileName_without_extension = path.parse(filePath).name;
    var extension = path.parse(filePath).ext;
    var newFileName = fileName_without_extension + "_translated" + extension;
    var parentDir = path.dirname(filePath);
    var newFilePath = path.join(parentDir, newFileName);
    if (fileTypeList.includes(path.extname(filePath))) {
        astTraverse(filePath);
        // 写入新内容到文件
    }
};
function traverseFilesInDirectory(directoryPath) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, files, _i, files_1, childFile, childFilePath;
        return __generator(this, function (_a) {
            stats = fs.statSync(directoryPath);
            if (stats.isFile()) {
                console.log('是一个文件');
                dealEachFile(directoryPath);
            }
            else {
                console.log('是一个目录');
                files = fs.readdirSync(directoryPath);
                for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                    childFile = files_1[_i];
                    childFilePath = path.join(directoryPath, childFile);
                    traverseFilesInDirectory(childFilePath);
                }
            }
            return [2 /*return*/];
        });
    });
}
var traverseAllFiles = function (filePath) {
    traverseFilesInDirectory(filePath);
};
var writeFile = function (jsonStr_toTraslate, filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs.writeFile(filePath, jsonStr_toTraslate, 'utf8', function (writeErr) {
            if (writeErr) {
                console.error(writeErr);
                return writeErr;
            }
            console.log('文件内容已修改。');
            return true;
        });
        return [2 /*return*/];
    });
}); };
var extractChinese = function () {
    // const filePath = path.join(__dirname, FilePath_ToTranslate)
    var projectRoot = process.cwd();
    var filePath = path.join(projectRoot, './src/test/index.ts');
    console.log('-----filePath-----', filePath);
    traverseAllFiles(filePath);
    var jsonStr_toTraslate = JSON.stringify(Array.from(Set_ToTranslate));
    var destinateFileName = new Date().getTime();
    var destinateFilePath = path.join(projectRoot, "./src/locale/toTranslate/" + destinateFileName + ".json");
    writeFile(jsonStr_toTraslate, destinateFilePath);
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
