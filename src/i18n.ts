import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import geCommon from './locales/ge/common.json'
import enCommon from './locales/en/common.json'
import ruCommon from './locales/ru/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ge: { common: geCommon },
      en: { common: enCommon },
      ru: { common: ruCommon },
    },
    fallbackLng: 'ge',
    defaultNS: 'common',
    detection: {
      order: ['localStorage'], // only restore a previously chosen language; ignore browser language
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
