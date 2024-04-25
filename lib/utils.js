import t from '@babel/types'; //GeneratorResult , StringLiteral
import babel from '@babel/core';
import fs from 'fs';
// import _traverse from '@babel/traverse'
import _generator from '@babel/generator';
const template = babel.template;
const generator = _generator.default;
const traverse = babel.traverse;
// const ImportStr_notHooks = 'import i18next from "i18next"'
const ImportStr_notHooks = 'import { t } from "i18next"';
const NotHooksStr = 'const { t } = i18next';
const exposeHookFunc_codeStr = 'const {t} = useTranslation()';
// path本身是一个函数节点
export const isTopFunction = (path) => {
    return isFunction(path)
        && !path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression());
};
export const getTopFunctionPath = (path) => {
    const parentFunc = path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression() || p.isFunctionDeclaration());
    if (parentFunc) {
        return parentFunc;
    }
    if (isFunction(path)) {
        return path;
    }
};
// path本身可以是任意类型节点
export const isInFunction = (path) => {
    return path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression());
};
export const getTopPath = (path) => {
    const programPath = path.findParent(p => p.isProgram());
    return programPath;
};
// export const importWithoutHooks = (path:NodePath ) => {
//   if (!isInFunction(path)) {
//     const programPath = getTopPath(path)
//     const importAst = template.ast `${ImportStr_notHooks}`
//     programPath?.node.body.unshift(importAst as Statement);
//     // programPath?.node.body.push(importAst as Statement);
//   }
// }
export const getAllImport = (path) => {
    const programPath = getTopPath(path);
    const importList = programPath === null || programPath === void 0 ? void 0 : programPath.node.body.filter((item) => item.type === 'ImportDeclaration');
    return importList;
};
export const hasImport = (ast, source) => {
    let hasImport = false;
    traverse(ast, {
        ImportDeclaration({ node }) {
            const hasImportedFunc = node.specifiers.find((item) => {
                if (item.type === 'ImportSpecifier') {
                    if (item.imported && item.imported.type === 'Identifier') {
                        return item.imported.name === 't';
                    }
                }
                return false;
            });
            if (node.source.value !== source && hasImportedFunc) {
                hasImport = true;
            }
        },
    });
    return hasImport;
};
// import { t } from "i18next"
export const hasImported_TFuncOfI18next = (path) => {
    const importList = getAllImport(path);
    return !!importList.find(item => {
        const source = item.source.value === "i18next";
        const imported = item.specifiers.find((item) => {
            if (item.type === 'ImportSpecifier') {
                if (item.imported && item.imported.type === 'Identifier') {
                    return item.imported.name === 't';
                }
            }
            return false;
        });
        return !!(source && imported);
    });
};
export const checkAndImport_TFuncOfI18next = (path) => {
    const programPath = getTopPath(path);
    const flag = hasImported_TFuncOfI18next(path);
    if (!flag) {
        const importList = getAllImport(path);
        const hasImported = importList.find(item => {
            const source = item.source.value === "i18next";
            const imported = item.specifiers.find((item) => {
                if (item.type === 'ImportSpecifier') {
                    if (item.imported && item.imported.type === 'Identifier') {
                        return item.imported.name === 't';
                    }
                }
                return false;
            });
            return !!(source && imported);
        });
        // 未曾导入
        if (!hasImported) {
            // todo: importAst1和importAst的区别？？？？？？？
            // const importAst1 = template.ast `${ImportStr_notHooks}`
            //   const importAst2 = babel.template(`
            //   import { t } from 'i18next';
            // `)();
            const importAst = template.ast `import { t } from 'i18next';`;
            programPath === null || programPath === void 0 ? void 0 : programPath.node.body.unshift(importAst);
        }
    }
};
// 检测并插入非hook形式的import： import { t } from "i18next"
export const check_insertImport_withoutHook = (path) => {
    const Flag_InFunction = isInFunction(path);
    if (!Flag_InFunction) {
        // 不在函数中，不可用hook形式
        checkAndImport_TFuncOfI18next(path);
    }
    else {
        // 非React组件函数 && 非自定义Hook函数，不可用hook形式
        if (!isCustomReactHookFunc(path) && !isReactFuncComp(path)) {
            checkAndImport_TFuncOfI18next(path);
        }
    }
};
export const getExposeHookNode = () => {
    const id = t.objectPattern([
        t.objectProperty(t.identifier('t'), t.identifier('t'))
    ]);
    const init = t.callExpression(t.identifier('useTranslation'), []);
    const variableDeclarator = t.variableDeclarator(id, init);
    return t.variableDeclaration('const', [variableDeclarator]);
};
// 函数组件、自定义hook中：检测，暴露t函数 const { t } = useTranslation()
export const check_insertExposeHook = (path) => {
    var _a, _b;
    // const Flag_InFunction = isInFunction(path)
    // if (!Flag_InFunction) return
    const topFuncPath = getTopFunctionPath(path);
    if (path.node.value === 'abc ts文件2') {
        console.log('---func name-----', (topFuncPath === null || topFuncPath === void 0 ? void 0 : topFuncPath.parent).id.name);
    }
    if (!topFuncPath)
        return;
    // if (!isTopFunction(path)) return
    if (isCustomReactHookFunc(topFuncPath) || isReactFuncComp(topFuncPath)) {
        // if ((path.node as StringLiteral).value === 'abc ts文件2') {
        console.log('---func name hooks-----', (topFuncPath === null || topFuncPath === void 0 ? void 0 : topFuncPath.parent).id.name, hasInsert_ExposeHook(path));
        // } 
        if (hasInsert_ExposeHook(path))
            return; // 已插入
        // const hooksAst = template.ast`${exposeHookFunc_codeStr}`;
        const hooksAst = template.ast `const {t} = useTranslation();`;
        // const hooksAst = getExposeHookNode()
        // const {ast} = babel.transformSync('const {t} = useTranslation();', {
        //   sourceType: 'module',
        //   parserOpts: {
        //     plugins: ['jsx', 'typescript'],
        //   },
        //   ast: true,
        // }) || {}
        // const hooksAst = ast?.program.body[0] as Statement
        let body = null;
        if (t.isArrowFunctionExpression(topFuncPath.node)) {
            if (topFuncPath.node.body.type === 'BlockStatement') {
                body = (_a = topFuncPath.node.body) === null || _a === void 0 ? void 0 : _a.body;
            } // else 走stringLiteral逻辑
        }
        else {
            body = (_b = topFuncPath.node.body) === null || _b === void 0 ? void 0 : _b.body;
        }
        if (body) {
            console.log('-----hooksAst-----', generator(hooksAst, { jsescOption: { minimal: true }, compact: true }));
            hooksAst && body.unshift(hooksAst);
        }
    }
};
export const hasInsert_ExposeHook = (path) => {
    const topFuncPath = getTopFunctionPath(path);
    if (!topFuncPath)
        return true;
    if (isCustomReactHookFunc(topFuncPath) || isReactFuncComp(topFuncPath)) {
        let body = null;
        if (t.isArrowFunctionExpression(topFuncPath.node)) {
            if (t.isBlockStatement(topFuncPath.node.body)) {
                body = topFuncPath.node.body.body;
                console.log('----body-------', body);
            }
        }
        else {
            body = topFuncPath.node.body.body;
        }
        console.log('----body-------', body);
        const str = generator(template.ast `const {t} = useTranslation()`, { jsescOption: { minimal: true }, compact: true });
        if (body) {
            return body.find((each) => {
                if (t.isVariableDeclaration(each)) {
                    const codeStr = generator(each, { jsescOption: { minimal: true }, compact: true });
                    console.log('---hasInsert_ExposeHook--codeStr---exposeHookFunc_codeStr-', codeStr.code, str.code);
                    return codeStr.code === str.code;
                }
                return false;
            });
        }
    }
    return false;
};
// // 函数组件、自定义hook中：检测，暴露t函数 const { t } = useTranslation()
// export const check_insertExposeHook = (path: NodePath) => {
//   if (!isTopFunction(path)) return
//   if (isCustomReactHookFunc(path) && isReactFuncComp(path)) { 
//     if (hasInsert_ExposeHook(path)) return // 已插入
//     const hooksAst = template.ast`${exposeHookFunc_codeStr}`;
//     let body = null
//     if (t.isArrowFunctionExpression(path.node)) {
//         if (path.node.body.type === 'BlockStatement') {
//           body = (path.node.body as BlockStatement)?.body
//         } // else 走stringLiteral逻辑
//     } else {
//       body = (path.node as FunctionExpression | FunctionDeclaration).body.body
//     }
//     if (body) {
//       body.unshift(hooksAst  as Statement)
//     }
//   }
// }
// export const hasInsert_ExposeHook = (path: NodePath) => {
//   if (!isTopFunction(path)) return true // 非顶层函数，不能插入目标代码
//   let body = null
//   if (t.isArrowFunctionExpression(path.node)) {
//     if (t.isBlockStatement(path.node.body)) {
//       body = path.node.body.body
//     }
//   } else {
//     body = (path.node  as FunctionExpression | FunctionDeclaration).body.body
//   }
//   if (body) {
//     return body.find((each) => {
//       if (t.isVariableDeclaration(each)) {
//         const codeStr = generator(each, {jsescOption: {minimal: true}})
//         console.log('---hasInsert_ExposeHook--codeStr----', codeStr)
//         return exposeHookFunc_codeStr === codeStr
//       }
//       return false
//     })
//   }
//   return false
// }
export const isReactFuncComp = (path) => {
    var _a;
    const { type, node } = path;
    // 函数表达式：常规函数、箭头函数
    if (['ArrowFunctionExpression', 'FunctionExpression'].includes(type)) {
        const { parent } = path;
        if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
            const funcName = parent.id.name;
            if (startWithUpperLetter(funcName)) {
                console.log('---isReactFuncComp-funcName-----', funcName);
            }
            return startWithUpperLetter(funcName);
        }
    }
    else if (type === 'FunctionDeclaration') {
        // 函数声明
        const funcName = (_a = node.id) === null || _a === void 0 ? void 0 : _a.name;
        return funcName && startWithUpperLetter(funcName);
    }
    return false;
};
export const isCustomReactHookFunc = (path) => {
    var _a;
    const { type, node } = path;
    // 函数表达式：常规函数、箭头函数
    if (t.isArrowFunctionExpression(path.node) || t.isFunctionExpression(path.node)) {
        const { parent } = path;
        if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
            const funcName = parent.id.name;
            if (startWithUse(funcName)) {
                console.log('---isCustomReactHookFunc-funcName-----', funcName);
            }
            return startWithUse(funcName);
        }
    }
    else if (t.isFunctionDeclaration(path.node)) {
        // 函数声明
        const funcName = (_a = node.id) === null || _a === void 0 ? void 0 : _a.name;
        return funcName && startWithUse(funcName);
    }
    return false;
};
export const isFunction = (path) => {
    return t.isArrowFunctionExpression(path.node) || t.isFunctionExpression(path.node) || t.isFunctionDeclaration(path.node);
};
function startWithUpperLetter(str) {
    return /^[A-Z]/.test(str);
}
function startWithUse(str) {
    return str.substring(0, 'use'.length) === 'use';
}
export const getKey = (keyMap, chinesesStr) => {
    return Object.keys(keyMap).find((key) => keyMap[key] === chinesesStr);
};
export const writeFileIfNotExists = (directoryPath, fileName, content) => {
    // 检查目录是否存在
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true }); // 如果不存在，创建目录
    }
    const filePath = `${directoryPath}/${fileName}`;
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content); // 如果不存在，创建并写入文件
    }
    else {
        fs.writeFileSync(filePath, content); // 如果存在，写入内容
    }
};
