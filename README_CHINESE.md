# i18n-react-quick-deal        [English](./README.md)

> 快速处理react项目的国际化以提高效率，特别对于历史存在的大体量项目
> 它主要做了两件事：提取待翻译中文，替换待翻译中文

   
👉 国际化方案基于`i18next` 和 `react-i18next`。
   
   所以，仅可用于React项目，并且，你应该使用`i18next`来实现你项目的国际化。

## 安装
```bash
npm install i18n-react-quick-deal
```
## 使用

#### 1. 在你的项目中配置package.json文件
```
   "scripts": {
        "extractCh": "i18n-react-extract --source=./src --chinesedir=./src/locale/chinese",
        "replaceCh": "i18n-react-replace --source=./src --keymap=./src/locale/keyMap/index.js ",
   }
```
当然，你可以配置自己想要的路径参数。

`--source`表示待翻译的目录或文件路径，默认值 --source=./src

`--chinesedir`表示抽取出的中文存放目录，默认值 --chinesedir=./src/locale/chinese

`--keymap`表示你准备好的Key-中文的映射文件存放目录，默认值 --keymap=./src/locale/keyMap/index.js

#### 2. 提取待翻译中文

```
    npm run extractCh
```

从`--source`目录或文件中提取待翻译中文，写入文件夹`--chinesedir`中。

每一次运行该命令，将会得到一个新的`.text` 文件。

它应该像这样：
```
    姓名
    地址
    你好，{{name}}
    哦{{score}}分低于最低线{{lowerestScore}}

```

👉 如果你不想翻译某个单词或者表达式，可以使用 `/* i18n-ignore */`来忽略。

例如：

```
    <Input placeholder={/* i18n-ignore */`请输入你的姓名：${PageSize}`} />
```

#### 3.准备keyMap（键值-中文）映射文件，`.js`格式

根据提取出的待翻译中文，准备好你的key映射文件。

它应该像这样：

```
    export const keyChineseMap = {
        "name": "姓名",
        "common.address": "地址",
        "common.hello": "你好，{{name}}",
        "score.lowestExpression": "哦{{score}}分低于最低线{{lowerestScore}}",
    }
``` 

对于键值Key部分， `common.address`表示数据结构，表示对象`common`下的属性 `address`。

对于值Value部分，你也可以使用占位符，如果项目代码中有变量或者表达式。

这部分可以参考`i18next`。

#### 4. 用键值替换中文
 
```
    npm run replaceCh
```

这个命令，首先它从`--source`这个文件夹或者文件中的中文全部替换为key值。

其次，为每一个需要`import`的文件插入合适的包导入语句，例如`import { useTranslation } from "react-i18next"` 或者`import { t } from "i18next"`。

每一次运行这个命令，将会创建名称带`_translated`的新文件，与每一个待翻译文件对应。

如果你检查过这些生成的`_translated`文件，确认没有问题后，可以用它们替换你的原文件。





