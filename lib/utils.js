import babel from '@babel/core';
import fs from 'fs';
const template = babel.template;
const ImportStr_notHooks = 'import i18next from "i18next"';
const NotHooksStr = 'const { t } = i18next';
// path本身是一个函数节点
export const validTopFunctionPath = (path) => {
    return (path.isArrowFunctionExpression() || path.isFunctionExpression())
        && !path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression());
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
export const hasImported_TFuncOfI18next = (path) => {
    const importList = getAllImport(path);
    return !!importList.find(item => {
        const source = item.source.value === 'i18next';
        const importedHooks = item.specifiers.find((item) => {
            if (item.type === 'ImportSpecifier') {
                if (item.imported && item.imported.type === 'Identifier') {
                    return item.imported.name === 't';
                }
            }
            return false;
        });
        return !!(source && importedHooks);
    });
};
export const checkAndImport_TFuncOfI18next = (path) => {
    const programPath = getTopPath(path);
    const flag = hasImported_TFuncOfI18next(path);
    if (!flag) {
        const importAst = template.ast `${ImportStr_notHooks}`;
        programPath === null || programPath === void 0 ? void 0 : programPath.node.body.unshift(importAst);
    }
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
