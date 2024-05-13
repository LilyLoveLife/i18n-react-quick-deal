"use strict";

import { useTranslation } from 'react-i18next';
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
/* eslint-disable no-useless-concat */

// import { useTranslation } from "react-i18next";

const PageSize = 20;
const List = () => {
  const {
    t
  } = useTranslation();
  // const { t } = useTranslation();
  const a = false;
  const [score, setScore] = (0, _react.useState)(59);
  (0, _react.useEffect)(() => {
    // 做特殊逻辑
    const key = localStorage.getItem('tabKey');
    if (key) {
      setActiveKey(key);
      // localStorage.removeItem('tabKey')
    }
  }, []);
  // 切换
  const onChange = key => {
    setActiveKey(key);
    localStorage.setItem('tabKey', key);
  };
  const [activeKey, setActiveKey] = (0, _react.useState)('todo');
  const tabBarItems = [{
    key: 'todo',
    title: t('list.mytodo')
  }, {
    key: 'done',
    title: t('list.done')
  }];
  /**
   * 今日面试
   * @returns 
   */
  const getStr = str => {
    return t('list.today');
  };
  // const getDom = () => {
  //   // <span className={styles.name}>{getStr('error今日面试')}{`今日面试:${PageSize}`}</span>
  //   return <span className={styles.name}>error今日面试{`今日面试:${PageSize}`}</span>
  // }
  const getLabel = () => {
    const map1 = {
      name: t("name"),
      // "11aa 姓名aa "
      address: /* i18n-ignore */'22aa 地址aa',
      /* i18n-ignore */
      age: t("common.name33aa", {
        "PageSize": PageSize
      }),
      age2: `${translate(t('common.name44aa'))} ${PageSize}`
    };
  };
  const func1 = name => {
    return /* i18n-ignore */'今日面试';
  };
  const translate = name => {
    return '1111111';
  };
  const aa = false;
  const four = /* #__PURE__ */ /* foo */translate('aa');
  return <>
      <div>
        <div>{t("score.lowestExpression", {
          "score": score
        })}</div>
        {/* t(``, {score}) */}
        {/* i18n-ignore */}
        <div>{t('score.o')}{score}{t('score.lowest')}</div>
      </div>
      {/* { activeKey === "todo" && <MyToDo /> }
       { activeKey === "done" && <MyDone /> } */}
      <input placeholder={t('inputAge1')} />
      <input placeholder={t('inputAge2')} />
      <input placeholder={t("inputAge3") + `${PageSize}`} />
      <input placeholder={t("inputAge4") + `${PageSize}`} />
      {/* <Input
        placeholder={
          t('请输入你的年龄5：{{PageSize}}', {
          "PageSize": PageSize
          })
        }
       /> */}
      <input placeholder={/* i18n-ignore */`请输入你的年龄5：${PageSize}`} />
      {true && <input placeholder={t('inputAge6')} />}
      <input placeholder={aa ? t("inputAge7") : t("inputAge8")} />
      {/* <div>{ getStr('请注意，安全！') }</div> */}
      {/* <div>{ t('00今日面试') }</div> */}
      <div>{t('11今日面试')}</div>



      {/* dom中，逗号3` */}
      <span>{t("22aa今日面试:{{PageSize}}", {
        "PageSize": PageSize
      })}</span>
      {/* <span>{`${getStr('今日面试')}:${PageSize}`}</span> */}

      <span>{t('33aa今日面试:')}{PageSize}</span>
      {/* <span>{getStr('今日面试')}:{PageSize}</span> */}
      <div>{t("电话1：{{PageSize}}", {
        "PageSize": PageSize
      })}</div>
      <div>{t("telephone") + `${PageSize}`}</div>
      <span>{t("Expression33TodayExpression", {
        "params0": PageSize ? '1' : '2',
        "params1": PageSize ? '1' : '2'
      })}</span>
      {/* todo */}
      {/* 44今日面试 */}
      {/* { getStr('今日面试') } */}
      {/* </div > */}
    </>;
};
var _default = exports.default = List;