import { defineConfig } from "cypress";
import fs from 'fs'
import path from 'path'
interface IFileMap {
  sourceFile: string, resultFilePattern: string
}

const readFileContentByLine = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath).toString();
  const lines = fileContent.split('\n');
  return lines;
}
const readFileContent = (filePath: string) => {
  return  fs.readFileSync(filePath, 'utf8').toString();
}
const getFileMap = (filePath: string) => {
    
}
const reverseRelacedDir = (fileMapList: IFileMap[], directoryPath: string) => {
  const stats = fs.statSync(directoryPath);
      if (stats.isFile()) {
        if (!directoryPath.includes('_translated_')) {
          // index_translated_
          const fileName_without_extension = path.parse(directoryPath).name
          const extension = path.parse(directoryPath).ext
          fileMapList.push({
            sourceFile: directoryPath,
            resultFilePattern: `${fileName_without_extension}_translated_` //结果文件名带时间戳
          })
        }
      } else if (stats.isDirectory()){
        const files = fs.readdirSync(directoryPath);
    
        for (const childFile of files) {
          const childFilePath = path.join(directoryPath, childFile);
          reverseRelacedDir(fileMapList, childFilePath)
        }
      } else {
        console.log('文件或目录不存在！', directoryPath)
      }
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
        getReplaceResult() {
          const source = './src/file4Test/source'
          // const dest = './src/file4Test/source'
          const fileMapList: IFileMap[] = []
          reverseRelacedDir(fileMapList, source)
          // todo: 
          // 1. 根据fileMapList中resultFilePartern找到result文件，
          //    可能有多个，选取时间戳最近的那个作为resultFile
          // 2. 比较sourceFile和resultFile的文件内容是否一致
        
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
