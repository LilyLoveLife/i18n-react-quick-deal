import { useTranslation } from 'react-i18next';
const getStr = () => {
  const { t } = useTranslation();
  const name = 'Han Meimei';
  const str = t("新学生名字叫{{name}}", {
    "name": name
  });
  const str2 = t("{{param0}}老师们名字叫{{param1}}", {
    "params0": false ? t("早上好") : t("下午好"),
    "params1": true ? t("李雷") : t("韩梅梅")
  });
  return str;
};
export { getStr };