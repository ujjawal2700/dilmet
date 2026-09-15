/**
 * Translation Service - Dynamic Translation Disabled
 * (Returning original text to avoid API costs)
 */


/**
 * Detect language of text
 * @param {string} text - Text to detect language of
 * @returns {Promise<string>} - Language code ('en', 'hi', etc.)
 */
export const detectLanguage = async (text) => {
    if (!text || !text.trim()) return 'en';

    try {
        // Simple heuristic: if contains Devanagari script, it's Hindi
        const hindiPattern = /[\u0900-\u097F]/;
        if (hindiPattern.test(text)) {
            return 'hi';
        }
        return 'en';
    } catch (error) {
        console.error('Language detection error:', error);
        return 'en';
    }
};

/**
 * Stub translation - returns original text
 * (Google Translate API disabled for dynamic data)
 */
export const translateText = async (text, targetLang, sourceLang = null) => {
    // Dynamic translation removed as per user request
    return text;
};

/**
 * Stub batch translation - returns original texts
 * (Google Translate API disabled for dynamic data)
 */
export const translateBatch = async (texts, targetLang) => {
    // Dynamic translation removed as per user request
    return texts || [];
};

/**
 * Stub profile translation - sets all language versions to original text
 * (Google Translate API disabled for dynamic data)
 */
export const translateProfileData = async (data) => {
    const { name, bio } = data;

    // We no longer translate dynamically. We just store the same text in all language fields.
    const result = {
        name,
        name_en: name,
        name_hi: name,
        bio: bio || '',
        bio_en: bio || '',
        bio_hi: bio || ''
    };

    return result;
};

export default {
    detectLanguage,
    translateText,
    translateBatch,
    translateProfileData
};
