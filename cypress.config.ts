/// <reference types="cypress" />

import { defineConfig } from "cypress";
import fs from 'fs'
import path from 'path'
const readFileContentByLine = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath).toString();
  const lines = fileContent.split('\n');
  return lines;
}
export default defineConfig({
  e2e: {
    // fileServerFolder: '',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        getExtractResult() {
          const root = process.cwd()
          const source = './src/file4Test'
          const dest = './src'

          // const command = `node ./lib/extract/index --source=${source} --chinesedir=${dest}`
          // console.log('----command-----', command)
          // cy.exec(command, { timeout: 6000 }).then(() => {

            let filePath = source //path.join(root, source);
            let destinateDirPath = dest //path.join(root, dest);
            console.log('----destinateDirPath-----', destinateDirPath)
            const files = fs.readdirSync(destinateDirPath)
            console.log('----files-----', files)
            const fileDateList: number[] = []
            // 文件名在files数组中
            files.forEach((file) => {
              // expect.console.log('file: ', file);
              const fileName_without_extension = path.parse(file).name
              console.log('----fileName_without_extension-----', fileName_without_extension)
              const extension = path.parse(filePath).ext
              const dateReg = /^[1-9][0-9]*$/
              if (extension === '.txt' && dateReg.test(fileName_without_extension)) {
                  fileDateList.push(Number(fileName_without_extension))
              }
            })
            const latest = Math.max.apply(null, fileDateList)
            const latestFile = `${latest}.txt`
            let resultFilePath = `./src/${latestFile}` //path.join(destinateDirPath, latestFile);
            console.log('----resultFilePath-----', resultFilePath)
            const lines = readFileContentByLine(resultFilePath)
            console.log('----result-----', lines)
            return lines
          // })
        },
        log(message) {
          console.log(message)
          return null
        },
      })
    },
  },
});
