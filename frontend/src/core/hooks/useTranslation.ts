import { useTranslation as useI18nextTranslation } from 'react-i18next';

/**
 * Custom hook for translations using react-i18next
 * Provides a simple t() function for translating text
 */
export const useTranslation = () => {
    const { t, i18n } = useI18nextTranslation();

    const changeLanguage = (lang: 'en' | 'hi') => {
        i18n.changeLanguage(lang);
    };

    const currentLanguage = i18n.language as 'en' | 'hi';

    return {
        t,
        changeLanguage,
        currentLanguage
    };
};
