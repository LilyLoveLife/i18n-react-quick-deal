// import { runExec } from 'jest-process';
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import {expect} from '@jest/globals';


// import {readFileContentByLine} from '../utils'
// import extractChinese from 'lib/extract/index'
const readFileContentByLine = (filePath: string) => {
    const fileContent = fs.readFileSync(filePath).toString();
    const lines = fileContent.split('\n');
    return lines;
}
const toBeChineseEqual: () => jest.CustomMatcherResult | Promise<jest.CustomMatcherResult> = async () => {
    console.log('toBeChineseEqual');
    const source = './src/file4Test'
    const dest = './src/locale/chinese'
    const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`
    const root = process.cwd()
    // console.log('process.cwd: ', root);
    let filePath = path.join(root, source);
    let destinateDirPath = path.join(root, dest);
    console.log('exec command 1');
    exec(command)
    console.log('exec command 2');
    const res =  new Promise<{ message: () => string; pass: boolean }>((resolve) => {
        console.log('promise');
        fs.readdir(destinateDirPath, (err, files) => {
            if (err) {
                console.log('Unable to scan directory: ' + err);
                // expect(err).toThrow()
                resolve({
                    message: () =>
                    'Extracted chineses is not as expected',
                    pass: false,
                });
                return 
            }
            console.log('files: ', files);
            const fileDateList: number[] = []
            // 文件名在files数组中
            files.forEach((file) => {
                console.log('file: ', file);
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
expect.extend({
    toBeChineseEqual,
});
// test('asymmetric ranges', async () => {
//     await expect.toBeChineseEqual()
//   });
describe("extract-group", () => {
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
    it("抽取出的中文", async () => {
       
        // const standardFile = path.join(root, './src/file4Test/chinese.txt');
        // const standardLines = readFileContentByLine(standardFile)
        console.log('-----expect.toBeChineseEqual------', expect.toBeChineseEqual)
        await expect.toBeChineseEqual()
    })
    // it("抽取出的中文文件内容", async() => {
    //     // expect(result.stdout).toEqual('Hello, Jest!\n');
    // })
});