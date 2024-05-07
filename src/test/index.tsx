
/* eslint-disable no-useless-concat */
import React, { useEffect, useState } from 'react'
// import { useTranslation } from "react-i18next";

const PageSize = 20

const List: React.FC = () => {
  // const { t } = useTranslation();
  const a = false
  const [score, setScore] = useState<number>(59)
  useEffect(() => {
    // 做特殊逻辑
    const key = localStorage.getItem('tabKey')
    if (key) {
      setActiveKey(key)
      // localStorage.removeItem('tabKey')
    }
  }, [])
  // 切换
  const onChange = (key: string) => {
    setActiveKey(key)
    localStorage.setItem('tabKey', key)
  }
  const [activeKey, setActiveKey] = useState('todo')
  const tabBarItems = [
    {
      key: 'todo',
      title: '我的待办',
    },
    {
      key: 'done',
      title: '操作记录',
    },
  ]
  /**
   * 今日面试
   * @returns 
   */
  const getStr = (str: any) => {
    return '今日面试'
  }
  // const getDom = () => {
  //   // <span className={styles.name}>{getStr('error今日面试')}{`今日面试:${PageSize}`}</span>
  //   return <span className={styles.name}>error今日面试{`今日面试:${PageSize}`}</span>
  // }
  const getLabel = () => {
    const map1 = {
      name: `姓名`, // "11aa 姓名aa "
      address: /* i18n-ignore */'22aa 地址aa',
      /* i18n-ignore */
      age: `33aa姓名 ${PageSize}`,
      age2: `${translate('44aa姓名')} ${PageSize}`
    }
  }
  const func1 = (name: string) => {
    return /* i18n-ignore */'今日面试'
  }
  const translate = (name: string) => {
    return '1111111'
  }
  const aa = false
  const four = /* #__PURE__ */ /* foo */ translate('aa');

  return (
    <>
      <div>
        <div>{ `哦${score}分低于最低线` }</div>
        {/* t(``, {score}) */}
        {/* i18n-ignore */}
        <div>哦{ score }分低于最低线</div>
      </div>
      {/* { activeKey === "todo" && <MyToDo /> }
      { activeKey === "done" && <MyDone /> } */}
      <input placeholder='请输入你的年龄1' />
      <input placeholder="请输入你的年龄2" />
      <input placeholder={ '请输入你的年龄3' + `${PageSize}` } />
      <input placeholder={ `请输入你的年龄4` + `${PageSize}` } />
      {/* <Input
        placeholder={
          t('请输入你的年龄5：{{PageSize}}', {
          "PageSize": PageSize
          })
        }
      /> */}
      <input placeholder={ /* i18n-ignore */`请输入你的年龄5：${PageSize}` } />
      { true && <input placeholder='请输入你的年龄6' /> }
      <input placeholder={ aa ? '请输入你的年龄7' : '请输入你的年龄8' } />
      {/* <div>{ getStr('请注意，安全！') }</div> */ }
      {/* <div>{ t('00今日面试') }</div> */ }
      <div>11今日面试</div>



      {/* dom中，逗号3` */ }
      <span>{ `22aa今日面试:${PageSize}` }</span>
      {/* <span>{`${getStr('今日面试')}:${PageSize}`}</span> */ }

      <span> 33aa今日面试:{ PageSize }</span>
      {/* <span>{getStr('今日面试')}:{PageSize}</span> */ }
      <div>{ `电话1：${PageSize}` }</div>
      <div>{ '电话2：' + `${PageSize}` }</div>
      <span>{ `${PageSize ? '1' : '2'}33今日面试:${PageSize ? '1' : '2'}` }</span>
      {/* todo */ }
      {/* 44今日面试 */ }
      {/* { getStr('今日面试') } */ }
      {/* </div > */ }
    </>
  )
}
export default List