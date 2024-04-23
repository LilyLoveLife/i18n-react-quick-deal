const getStr = () => {
    const name = 'Han Meimei'
    const str = `新学生名字叫${name}`
    const str2 = `${false ? '早上好' : '下午好'}老师们名字叫${true ? '李雷' : '韩梅梅'}`
    return str
}
export {getStr}
