// import { runExec } from 'jest-process';
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import {expect} from '@jest/globals';
import type {MatcherFunction} from  'expect';

const consoleSpy = jest.spyOn(console, 'log');

const toBeAbove: MatcherFunction<[argument: number]> = function (actual: unknown, argument: number) {
    const pass = typeof actual === 'number'&& (actual > argument);
    // 使用 ECMAScript 6 模板字符串自动插入值
    const message = pass
      ? `expected ${actual} not to be greater than ${argument}`
      : `expected ${actual} to be greater than ${argument}`;
    return { message: () => message, pass };
  }
expect.extend({
    toBeAbove
});
test('toBeAbove test', () => {
    expect(10).toBeAbove(5); // 这将会使用上面定义的 "toBeAbove" 匹配器
});
// import {readFileContentByLine} from '../utils'
// import extractChinese from 'lib/extract/index'
const readFileContentByLine = (filePath: string) => {
    const fileContent = fs.readFileSync(filePath).toString();
    const lines = fileContent.split('\n');
    return lines;
}
const logResult = console.log;
// : (consoleOutput: string[]) => jest.CustomMatcherResult | Promise<jest.CustomMatcherResult>
// consoleOutput: string[]
const toBeChineseEqual = async () => {
    // const logResult = console.log;
    logResult('toBeChineseEqual')
    // consoleOutput.push('toBeChineseEqual')
    const source = './src/file4Test'
    const dest = './src/locale/chinese'
    // const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`
    const root = process.cwd()
    // console.log('process.cwd: ', root);
    // let filePath = path.join(root, source);
    let destinateDirPath = path.join(root, dest);
    expect(consoleSpy).toHaveBeenCalledWith('---111-----');
    // expect.console.log('exec command 1');
    // consoleOutput.push('exec command 1')
    // exec(command, () => {

    // })
    // consoleOutput.push('exec command 2')
    // expect.console.log('exec command 2');
    const res =  new Promise<{ message: () => string; pass: boolean }>((resolve) => {
        // expect.console.log('promise');
        // consoleOutput.push('promise')
        debugger
        expect(consoleSpy).toHaveBeenCalledWith('---2222-----');
        fs.readdir(destinateDirPath, (err, files) => {
            if (err) {
                // consoleOutput.push('Unable to scan directory: ' + err)
                // expect.console.log('Unable to scan directory: ' + err);
                // expect(err).toThrow()
                resolve({
                    message: () =>
                    'Extracted chineses is not as expected',
                    pass: false,
                });
                return 
            }
            // consoleOutput.push('files: ', files.toString())
            // expect.console.log('files: ', files);
            expect(consoleSpy).toHaveBeenCalledWith('---files-----', files);
            const fileDateList: number[] = []
            // 文件名在files数组中
            files.forEach((file) => {
                // expect.console.log('file: ', file);
                const fileName_without_extension = path.parse(file).name
                const extension = path.parse(filePath).ext
                const dateReg = /^[1-9][0-9]*$/
                if (extension === 'txt' && dateReg.test(fileName_without_extension)) {
                    fileDateList.push(+fileName_without_extension)
                }
            })
            const latest = Math.max.apply(null, fileDateList)
            const latestFile = `${latest}.txt`
            let filePath = path.join(destinateDirPath, latestFile);
            const standardFile = path.join(root, './src/file4Test/chinese.txt');
            const standardLines = readFileContentByLine(standardFile)
            const lines = readFileContentByLine(filePath)
            if (standardLines.toString() === lines.toString()) {
                resolve({
                    message: () => 'pass',
                    pass: true,
                })
            } else {
                resolve({
                    message: () =>
                      'Extracted chineses is not as expected',
                    pass: false,
                })
            }
            
        })
    })
    return res
}

// expect.extend({
//     toBeChineseEqual () {
//         logResult('toBeChineseEqual')
//     // consoleOutput.push('toBeChineseEqual')
//     const source = './src/file4Test'
//     const dest = './src/locale/chinese'
//     const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`
//     const root = process.cwd()
//     // console.log('process.cwd: ', root);
//     let filePath = path.join(root, source);
//     let destinateDirPath = path.join(root, dest);
//     // expect.console.log('exec command 1');
//     // consoleOutput.push('exec command 1')
//     exec(command)
//     // consoleOutput.push('exec command 2')
//     // expect.console.log('exec command 2');
//     const res =  new Promise<{ message: () => string; pass: boolean }>((resolve) => {
//         // expect.console.log('promise');
//         // consoleOutput.push('promise')
//         debugger
//         fs.readdir(destinateDirPath, (err, files) => {
//             if (err) {
//                 // consoleOutput.push('Unable to scan directory: ' + err)
//                 // expect.console.log('Unable to scan directory: ' + err);
//                 // expect(err).toThrow()
//                 resolve({
//                     message: () =>
//                     'Extracted chineses is not as expected',
//                     pass: false,
//                 });
//                 return 
//             }
//             // consoleOutput.push('files: ', files.toString())
//             // expect.console.log('files: ', files);
//             const fileDateList: number[] = []
//             // 文件名在files数组中
//             files.forEach((file) => {
//                 // expect.console.log('file: ', file);
//                 const fileName_without_extension = path.parse(file).name
//                 const extension = path.parse(filePath).ext
//                 const dateReg = /^[1-9][0-9]*$/
//                 if (extension === 'txt' && dateReg.test(fileName_without_extension)) {
//                     fileDateList.push(+fileName_without_extension)
//                 }
//             })
//             const latest = Math.max.apply(null, fileDateList)
//             const latestFile = `${latest}.txt`
//             let filePath = path.join(destinateDirPath, latestFile);
//             const standardFile = path.join(root, './src/file4Test/chinese.txt');
//             const standardLines = readFileContentByLine(standardFile)
//             const lines = readFileContentByLine(filePath)
//             if (standardLines.toString() === lines.toString()) {
//                 resolve({
//                     message: () => 'pass',
//                     pass: true,
//                 })
//             } else {
//                 resolve({
//                     message: () =>
//                       'Extracted chineses is not as expected',
//                     pass: false,
//                 })
//             }
            
//         })
//     })
//     return res
//     },
// });
expect.extend({toBeChineseEqual})
// test('asymmetric ranges', async () => {
//     await expect.toBeChineseEqual()
//   });

// const judgeChinese = () => {
//     const source = './src/file4Test'
//     const dest = './src/locale/chinese'
//     const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`
//     exec(command, () => {
//         expect.toBeChineseEqual()
//     })
// }

describe("extract-group", () => {
    let consoleOutput: string[] = []
    beforeAll(() => {    
        jest.spyOn(console, 'log').mockImplementation((...args) => {
            consoleOutput.push(...args)
        })
    })
    it("first unit test", () => {
        expect(1 + 1).toBe(2);
    });
    const source = './src/file4Test'
    const dest = './src/locale/chinese'
    const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`
    const root = process.cwd()
    // console.log('process.cwd: ', root);
    let filePath = path.join(root, source);
    let destinateDirPath = path.join(root, dest);
    test("抽取出的中文",   (done) => {
       
        // const standardFile = path.join(root, './src/file4Test/chinese.txt');
        // const standardLines = readFileContentByLine(standardFile)
        // console.log('-----expect.toBeChineseEqual------', expect(consoleOutput).toBeChineseEqual)
        // await expect.toBeChineseEqual()
        const source = './src/file4Test'
        const dest = './src/locale/chinese'
        const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`        

        exec(command, async() => {
            // expect(consoleSpy).toHaveBeenCalledWith('---1111111-----');
            // consoleSpy.mockRestore();
            expect.toBeChineseEqual()
            done();
        })
    }, 60000)
    afterAll(() => {
        console.log('console output:', consoleOutput)
    })
        // it("抽取出的中文文件内容", async() => {
    //     // expect(result.stdout).toEqual('Hello, Jest!\n');
    // })
});

declare module 'expect' {
    interface AsymmetricMatchers {
        toBeChineseEqual(): void;
        toBeAbove(argument: number): void;
    }
    interface Matchers<R> {
        toBeChineseEqual(): R;
        toBeAbove(argument: number): R;
    }
    // interface PromiseMatchers{
    //     toBeChineseEqual(): void;
    // }
    // interface ExtendedMatchers extends jest.Matchers<void, number> {
    //     toBeAbove: (expected: number) => object;
    // }
}