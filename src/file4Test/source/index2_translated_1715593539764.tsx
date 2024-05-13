import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
export const getLabel = () => {
  const PageSize = 10;
  const map1 = {
    name: t("ts文件1"),
    // "11aa 姓名aa "
    address: t('abc ts文件2'),
    age: t("ts文件3 {{PageSize}}", {
      "PageSize": PageSize
    }),
    age2: `${t('ts文件4')} ${PageSize}`
  };
  return 111;
};
export const useLabel = () => {
  const {
    t
  } = useTranslation();
  const PageSize = 10;
  const map1 = {
    name: t("ts文件1"),
    // "11aa 姓名aa "
    address: t('abc ts文件2'),
    age: t("ts文件3 {{PageSize}}", {
      "PageSize": PageSize
    }),
    age2: `${t('ts文件4')} ${PageSize}`
  };
};
export const GetLabel = () => {
  const {
    t
  } = useTranslation();
  const PageSize = 10;
  const map1 = {
    name: t("ts文件1"),
    // "11aa 姓名aa "
    address: /* i18n-ignore */'abc ts文件2',
    age: t("ts文件3 {{PageSize}}", {
      "PageSize": PageSize
    }),
    age2: `${t('ts文件4')} ${PageSize}`
  };
  return 111;
};