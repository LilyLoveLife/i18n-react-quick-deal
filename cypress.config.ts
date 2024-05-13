import { defineConfig } from "cypress";
import fs from 'fs'
import path from 'path'
interface IFileMap {
  sourceFile: string, resultFilePattern: string
}

const RDateReg = /^[1-9][0-9]*$/;

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
          const dest = './src/file4Test/chinese'
  
          const files = fs.readdirSync(dest)
           
          const fileDateList: number[] = []
          let temp: any[] = []
            // 文件名在files数组中
          files.forEach((file) => {
              const fileName_without_extension = path.parse(file).name
              const extension = path.parse(file).ext
              temp.push({
                name: fileName_without_extension,
                extend: extension
              })
              if (extension === '.txt' && RDateReg.test(fileName_without_extension)) {
                  fileDateList.push(Number(fileName_without_extension))
              }
            })
            const latest = Math.max.apply(null, fileDateList)
            const latestFile = `${latest}.txt`
            let resultFilePath = `${dest}/${latestFile}`
            return readFileContent(resultFilePath)
        },
        validReplaceResult() {
          const source = './src/file4Test/source'
          const fileMapList: IFileMap[] = []
          reverseRelacedDir(fileMapList, source)
          if (!(fileMapList && fileMapList.length)) {
            return true
          }
          // 1. 根据fileMapList中resultFilePartern找到result文件，
          //    可能有多个，选取时间戳最近的那个作为resultFile
          // 2. 比较sourceFile和resultFile的文件内容是否一致
          const results = fileMapList.map((item) => {
            const {sourceFile, resultFilePattern} = item

            // 提取同层级的所有_translated_文件
            // "src/file4Test/source/index_translated_1715585190420.tsx"
            const dirPath = path.dirname(sourceFile)
            const files = fs.readdirSync(dirPath).map((fileName) => `${dirPath}/${fileName}`);
            const translatedList: string[] = [];
            (files || []).forEach((file) => {
              const stats = fs.statSync(file);
              if (stats.isFile()) {
                const fileName_without_extension = path.parse(file).name
                if (fileName_without_extension.includes(resultFilePattern)) {
                  translatedList.push(file)
                }
              }
            })
            // translatedList: ["src/file4Test/source/index_translated_1715583542768.tsx"]
            console.log('------translatedList-------', translatedList)

            // latest: "src/file4Test/source/index2_translated_1715585129880.tsx"
            const latest = translatedList.reduce((preFile, currFile) => {
              if (!preFile) return currFile
              const pre_timestamp = path.parse(preFile).name.split('_translated_')?.[1]
              const curr_timestamp = path.parse(currFile).name.split('_translated_')?.[1]
              if (RDateReg.test(pre_timestamp) && RDateReg.test(curr_timestamp)) {
                return  Number(pre_timestamp) > Number(curr_timestamp) ? preFile : currFile
              }
              return ''
            }, '')
            console.log('------latest-------', latest)
            if (latest) {latest
              return {
                ...item,
                resultFile: latest
              }
            }
          })
          // result: "src/file4Test/source/index_translated_1715585190420.tsx"
          // standard: "src/file4Test/source/translated/translated/index_translated.tsx"
          const obj2Valid: ({result: string, standard: string} | undefined)[] = results?.map((result) => {
            const {sourceFile, resultFile} = result || {}
            if (sourceFile && resultFile) {
              const resultDir = path.dirname(resultFile)
              const standardDir = resultDir.replace('source', 'standard/translated')
              const resultFileName = path.parse(resultFile).name.split('_translated_')?.[0]
              const standardFileName = `${resultFileName}`
              const extension = path.parse(resultFile).ext // 带小数点
              const standardFile = `${standardDir}/${standardFileName}_translated${extension}`
              return {
                result: resultFile,
                standard: standardFile
              }
            }
          })

         return obj2Valid?.every((each) => {
            const {result, standard} = each || {}
            if (result === undefined && standard === undefined) return true
            if (result && standard) {
              return readFileContent(result) === readFileContent(standard)
            }
            return false
          })
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
