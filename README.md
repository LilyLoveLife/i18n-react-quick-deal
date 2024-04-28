# react-customized

> Deal the react project quickly to improve the efficiency, especially for huge old project.
== It is based on `i18next` and `react-i18next`. ==
== So it is only for project by React, and you should internationalize your project based on i18next ==

Install from the [npm registry](https://www.npmjs.com/) with your package manager:
```bash
npm install i18n-react-quick-deal
```
## Usage

### Config in your project, package.json
```
   "scripts": {
        "extractCh": "i18n-react-extract --source=./src/test --chinesedir=./src/locale/chinese",
        "replaceCh": "i18n-react-replace --source=./src/test --keymap=./src/locale/keyMap/index.js ",
   }
```

### Extract chinese for translating

```
    npm run extractCh
```
The you can extract all chinese from the dir or file `--source`, and write them into dir `--chinesedir`. Everytime you run the npm script, you'll get a new `.text` file.

It will be like
```
姓名
地址
你好，{{name}}
哦{{score}}分低于最低线{{lowerestScore}}

```

### Replace the chinese with
You should get the keyMap file prepared according to the former extracted chinese.
It should be like this
```
    export const keyChineseMap = {
        "name": "姓名",
        "common.address": "地址",
        "common.hello": "你好，{{name}}",
        "score.lowestExpression": "哦{{score}}分低于最低线{{lowerestScore}}",
    }
```
`common.address` indicates the data structure, which means the attribute `address` of the object `common`

### Replace the chinese with
 
```
    npm run replaceCh
```
It will replace the chinese in `--source` dir or file with the key from `--keymap=`.
Everytime you run, it will create a new file with `_translated` for each file.

After you check the `_translated` file and make sure it's ok, you may use it to replace your origin file.






