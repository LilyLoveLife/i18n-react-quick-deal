import { NodePath } from "@babel/core";
import t from '@babel/types';
export declare const validTopFunctionPath: (path: NodePath) => boolean;
export declare const isInFunction: (path: NodePath) => NodePath<t.Node> | null;
export declare const getTopPath: (path: NodePath) => NodePath<t.Program>;
export declare const getAllImport: (path: NodePath) => t.ImportDeclaration[];
export declare const hasImported_TFuncOfI18next: (path: NodePath) => boolean;
export declare const checkAndImport_TFuncOfI18next: (path: NodePath) => void;
export declare const writeFileIfNotExists: (directoryPath: string, fileName: string, content: string) => void;
