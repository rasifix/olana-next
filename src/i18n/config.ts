import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// Browser language detection
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0]; // Get 'en' from 'en-US'
  return ['en', 'de', 'fr', 'it'].includes(browserLang) ? browserLang : 'de'; // Fallback to German
};

// Get language from localStorage or browser
const getInitialLanguage = (): string => {
  const stored = localStorage.getItem('language');
  return stored || getBrowserLanguage();
};

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
    fallbackLng: 'de',
    debug: process.env.NODE_ENV === 'development',
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    ns: ['translation'],
    defaultNS: 'translation',
    
    interpolation: {
      escapeValue: false // React already escapes
    },
    
    react: {
      useSuspense: true // Enable Suspense for proper loading handling
    }
  });

export default i18n;
