import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import az from './locales/az/translation.json';
import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';
import tr from './locales/tr/translation.json';

const savedLang = localStorage.getItem('lang') || 'az';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      az: { translation: az },
      en: { translation: en },
      ru: { translation: ru },
      tr: { translation: tr },
    },
    lng: savedLang,
    fallbackLng: 'az',
    interpolation: { escapeValue: false },
  });

export default i18n;