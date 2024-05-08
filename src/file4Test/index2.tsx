export const getLabel = () => {
    const PageSize = 10
    const map1 = {
      name: `ts文件1`, // "11aa 姓名aa "
      address: 'abc ts文件2',
      age: `ts文件3 ${PageSize}`,
      age2: `${t('ts文件4')} ${PageSize}`
    }  
    return 111
  }
  export const useLabel = () => {
    const PageSize = 10
    const map1 = {
      name: `ts文件1`, // "11aa 姓名aa "
      address: 'abc ts文件2',
      age: `ts文件3 ${PageSize}`,
      age2: `${t('ts文件4')} ${PageSize}`
    }
  }
  export const GetLabel = () => {
    const PageSize = 10
    const map1 = {
      name: `ts文件1`, // "11aa 姓名aa "
      address: /* i18n-ignore */'abc ts文件2',
      age: `ts文件3 ${PageSize}`,
      age2: `${t('ts文件4')} ${PageSize}`
    }  
    return 111
  }