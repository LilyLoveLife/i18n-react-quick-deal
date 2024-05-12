import { defineConfig } from "cypress";
import fs from 'fs'
import path from 'path'
const readFileContentByLine = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath).toString();
  const lines = fileContent.split('\n');
  return lines;
}
const readFileContent = (filePath: string) => {
  return  fs.readFileSync(filePath, 'utf8').toString();
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

            let filePath = source
            let destinateDirPath = dest
            const files = fs.readdirSync(destinateDirPath)
           
            const fileDateList: number[] = []
            let temp: any[] = []
            // 文件名在files数组中
            files.forEach((file) => {
              // expect.console.log('file: ', file);
              const fileName_without_extension = path.parse(file).name
              const extension = path.parse(file).ext
              const dateReg = /^[1-9][0-9]*$/;
              temp.push({
                name: fileName_without_extension,
                extend: extension
              })
              if (extension === '.txt' && dateReg.test(fileName_without_extension)) {
                  fileDateList.push(Number(fileName_without_extension))
              }
            })
            const latest = Math.max.apply(null, fileDateList)
            const latestFile = `${latest}.txt`
            let resultFilePath = `./src/${latestFile}`
            return readFileContent(resultFilePath)
        },
        readFileMaybe(filename) {
          if (fs.existsSync(filename)) {
            return readFileContent(filename)
          }
          return null
        },
        log(message) {
          console.log(message)
          return null
        },
      })
    },
  },
});
