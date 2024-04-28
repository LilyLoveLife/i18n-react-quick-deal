# i18n-react-quick-deal      [中文](./README_CHINESE.md)

> Deal the react project quickly to improve the efficiency, especially for huge old project.
> It mainly does two things for you: extract chinese and replace it with your prepared keymap.


👉 It is based on `i18next` and `react-i18next`.

   So it is only for project by React, and you should internationalize your project based on `i18next`
   

## Install
```bash
npm install i18n-react-quick-deal
```
## Usage

#### 1. Config in your project, package.json
```
   "scripts": {
        "extractCh": "i18n-react-extract --source=./src --chinesedir=./src/locale/chinese",
        "replaceCh": "i18n-react-replace --source=./src --keymap=./src/locale/keyMap/index.js ",
   }
```
Certainly you can configure your own path parameters。

`--source` indicates the dir or file for translating, default --source=./src

`--chinesedir` indicates the extracted Chinese directory, default --chinesedir=./src/locale/chinese

`--keymap` indicates the directory where the key Key-Chinese mapping file is stored, default --keymap=./src/locale/keyMap/index.js


#### 2. Extract chinese for translating

```
    npm run extractCh
```
The you can extract all chinese from the dir or file `--source`, and write them into dir `--chinesedir`. 

Everytime you run the npm script, you'll get a new `.text` file.

It will be like
```
姓名
地址
你好，{{name}}
哦{{score}}分低于最低线{{lowerestScore}}

```
👉 If you don't want to translate a word or expression, use `/* i18n-ignore */` just before it.

For example,

```
    <Input placeholder={/* i18n-ignore */`请输入你的姓名：${PageSize}`} />
```


#### 3. Prepare the keyMap `.js` file
You should get the Key-Chinese file prepared according to the former extracted chinese.
It should be like this
```
    export const keyChineseMap = {
        "name": "姓名",
        "common.address": "地址",
        "common.hello": "你好，{{name}}",
        "score.lowestExpression": "哦{{score}}分低于最低线{{lowerestScore}}",
    }
```
For the Key `common.address` indicates the data structure, which means the attribute `address` of the object `common`.
For the Value, you can also use placeholder as the value if the origin code has variable or expression.
You can refer to `i18next`.


#### 4. Replace the chinese with the key
 
```
    npm run replaceCh
```
Firstly it will replace the chinese in `--source` dir or file with the key from `--keymap=`. 

Secondly insert the appropriate `import` in the file which needs, like `import { useTranslation } from "react-i18next"` or`import { t } from "i18next"`.

Everytime you run, it will create a new file with `_translated` for each file.

After you check the `_translated` file and make sure it's ok, you may use it to replace your origin file.

The `_translated` file will be like this,

```
    return (
        <div>{ t("name") }</div>
        <div>/* i18n-ignore */姓名</div>
        <div>{ t("common.address") }</div>
        <div>{t("common.hello", {
            "name": name
        })}</div>
        <div>
            {
                t("哦{{score}}分低于最低线{{lowerestScore}}", {
                    "score": score,
                    "lowerestScore": lowerestScore
                })
            }
        </div>)
```






