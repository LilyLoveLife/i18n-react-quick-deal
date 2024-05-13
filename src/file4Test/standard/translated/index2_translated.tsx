"use strict";

import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useLabel = exports.getLabel = exports.GetLabel = void 0;
const getLabel = () => {
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
exports.getLabel = getLabel;
const useLabel = () => {
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
exports.useLabel = useLabel;
const GetLabel = () => {
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
exports.GetLabel = GetLabel;