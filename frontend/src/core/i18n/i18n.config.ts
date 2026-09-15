import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../../locales/en.json';
import hiTranslations from '../../locales/hi.json';

// Get saved language or default to English
const savedLanguage = localStorage.getItem('user_language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            hi: {
                translation: hiTranslations
            }
        },
        lng: savedLanguage, // Default language
        fallbackLng: 'en', // Fallback if translation missing
        interpolation: {
            escapeValue: false // React already escapes
        },
        react: {
            useSuspense: false // Disable suspense for simpler setup
        }
    });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('user_language', lng);
});

export default i18n;
