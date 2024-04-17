import { useTranslation } from 'react-i18next';
const getStr = () => {
  const { t } = useTranslation();
  const name = 'Han Meimei';
  const str = `${t('新学生名字叫')}${name}`;
  return str;
};
export { getStr };