import { useTranslation } from 'react-i18next';
import { NodePath } from "@babel/core";
import fs from 'fs';
import path from 'path';
export const validTopFunctionPath = (path: NodePath) => {
  const { t } = useTranslation();
  return !path.findParent(p => p.isArrowFunctionExpression() || p.isFunctionExpression());
};
export const writeFileIfNotExists = (directoryPath: string, fileName: string, content: string) => {
  const { t } = useTranslation();
  // 检查目录是否存在
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, {
      recursive: true
    }); // 如果不存在，创建目录
  }
  const filePath = `${directoryPath}/${fileName}`;

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content); // 如果不存在，创建并写入文件
  } else {
    fs.writeFileSync(filePath, content); // 如果存在，写入内容
  }
};