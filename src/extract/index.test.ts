// import { runExec } from 'jest-process';
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import {expect} from '@jest/globals';
import type {MatcherFunction} from  'expect';

const consoleSpy = jest.spyOn(console, 'log');
const readFileContentByLine = (filePath: string) => {
    const fileContent = fs.readFileSync(filePath).toString();
    const lines = fileContent.split('\n');
    return lines;
}
const toBeChineseEqual = async () => {
    const dest = './src/locale/chinese'
    // const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`
    const root = process.cwd()
    let destinateDirPath = path.join(root, dest);
    expect(consoleSpy).toHaveBeenCalledWith('---111-----');
    const res =  new Promise<{ message: () => string; pass: boolean }>((resolve) => {
        expect(consoleSpy).toHaveBeenCalledWith('---2222-----');
        const  files = fs.readdirSync(destinateDirPath)
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
    return res
}


expect.extend({toBeChineseEqual})

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
    test("抽取出的中文", (done) => {
        const source = './src/file4Test'
        const dest = './src/locale/chinese'
        const command = `node lib/extract/index --source=${source} --chinesedir=${dest}`        

        exec(command, async() => {
            expect.toBeChineseEqual()
            done();
        })
    }, 600000)
    afterAll(() => {
        console.log('console output:', consoleOutput)
    })
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
}