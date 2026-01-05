import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {} // Will be loaded dynamically
      },
      de: {
        translation: {} // Will be loaded dynamically
      },
      fr: {
        translation: {} // Will be loaded dynamically
      },
      it: {
        translation: {} // Will be loaded dynamically
      }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'de',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

// Load translation files dynamically
const loadTranslations = async () => {
  try {
    const enTranslation = await fetch('/locales/en/translation.json').then(res => res.json());
    const deTranslation = await fetch('/locales/de/translation.json').then(res => res.json());
    const frTranslation = await fetch('/locales/fr/translation.json').then(res => res.json());
    const itTranslation = await fetch('/locales/it/translation.json').then(res => res.json());
    
    i18n.addResourceBundle('en', 'translation', enTranslation, true, true);
    i18n.addResourceBundle('de', 'translation', deTranslation, true, true);
    i18n.addResourceBundle('fr', 'translation', frTranslation, true, true);
    i18n.addResourceBundle('it', 'translation', itTranslation, true, true);
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
};

loadTranslations();

export default i18n;
