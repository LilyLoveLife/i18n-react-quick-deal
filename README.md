# react-customized

> Deal the react project quickly to improve the efficiency, especially for huge old project.
> It mainly does two things for you: extract chinese and replace it with your prepared keymap.


👉 It is based on `i18next` and `react-i18next`.

   So it is only for project by React, and you should internationalize your project based on `i18next`

   国际化方案基于`i18next` 和 `react-i18next`。
   所以，仅可用于React项目，并且，你应该使用`i18next`来实现你项目的国际化。

## Install
```bash
npm install i18n-react-quick-deal
```
## Usage

#### 1. Config in your project, package.json
```
   "scripts": {
        "extractCh": "i18n-react-extract --source=./src/test --chinesedir=./src/locale/chinese",
        "replaceCh": "i18n-react-replace --source=./src/test --keymap=./src/locale/keyMap/index.js ",
   }
```

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
从`--source`目录或文件中提取待翻译中文，写入文件夹`--chinesedir`中。

每一次运行该命令，将会得到一个新的`.text` 文件。


If you don't want to translate a word or expression, use `/* i18n-ignore */` just before it.

如果你不想翻译某个单词或者表达式，可以使用 `/* i18n-ignore */`来忽略。

#### 3. Prepare the keyMap `.js` file
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
For the Key `common.address` indicates the data structure, which means the attribute `address` of the object `common`.
For the Value, you can also use placeholder as the value if the origin code has variable or expression.
You can refer to `i18next`.

根据提取出的待翻译中文，准备好你的key映射文件。 
对于键值Key部分， `common.address`表示数据结构，表示对象`common`下的属性 `address`。
对于值Value部分，你也可以使用占位符，如果项目代码中有变量或者表达式。
这部分可以参考`i18next`。

#### 4. Replace the chinese with
 
```
    npm run replaceCh
```
Firstly it will replace the chinese in `--source` dir or file with the key from `--keymap=`. 

Secondly insert the appropriate `import` in the file which needs, like `import { useTranslation } from "react-i18next"` or`import { t } from "i18next"`.

Everytime you run, it will create a new file with `_translated` for each file.

After you check the `_translated` file and make sure it's ok, you may use it to replace your origin file.

这个命令，首先它从`--source`这个文件夹或者文件中的中文全部替换为key值。
其次，为每一个需要`import`的文件插入合适的包导入语句，例如`import { useTranslation } from "react-i18next"` 或者`import { t } from "i18next"`。
每一次运行这个命令，将会创建名称带`_translated`的新文件，与每一个待翻译文件对应。
如果你检查过这些生成的`_translated`文件，确认没有问题后，可以用它们替换你的原文件。





