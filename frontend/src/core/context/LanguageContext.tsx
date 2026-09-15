/**
 * Language Context
 * Manages language state across the application
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import translateService from '../services/translate.service';
import { getStaticTranslation } from '../i18n/staticTranslations';

type Language = 'en' | 'hi';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (text: string) => Promise<string>;
    tSync: (text: string) => string;
    isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'user_language';

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Load from localStorage
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return (saved === 'hi' ? 'hi' : 'en') as Language;
    });

    const [isTranslating, setIsTranslating] = useState(false);

    // Save to localStorage whenever language changes
    useEffect(() => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        console.log(`🌐 Language set to: ${language === 'en' ? 'English' : 'हिंदी'}`);
    }, [language]);

    const setLanguage = useCallback((newLang: Language) => {
        setLanguageState(newLang);
    }, []);

    /**
     * Translate text (async)
     * Use for dynamic content
     */
    const t = useCallback(async (text: string): Promise<string> => {
        if (language === 'en') {
            return text; // No translation needed
        }

        try {
            setIsTranslating(true);
            const translated = await translateService.translate(text, 'en', language);
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback
        } finally {
            setIsTranslating(false);
        }
    }, [language]);

    /**
     * Translate text synchronously (from static dictionary or cache only)
     * Use for UI labels that need immediate rendering
     */
    const tSync = useCallback((text: string): string => {
        if (language === 'en') {
            return text;
        }

        // Try static translation first
        const staticTranslation = getStaticTranslation(text, language);
        if (staticTranslation) {
            return staticTranslation;
        }

        // Try cache (won't trigger API)
        const cacheKey = `en_${language}_${text.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0)}_${text.length}`;

        const cached = translateService['cache'][cacheKey];
        if (cached) {
            return cached;
        }

        // Fallback to original (will translate on next render if needed)
        return text;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tSync, isTranslating }}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * Hook to use translation
 */
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export default LanguageContext;
