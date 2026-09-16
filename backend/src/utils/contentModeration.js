/**
 * Content Moderation Utility - Backend
 * @purpose: Validate chat messages to prevent sharing phone numbers / excessive digits (max 4 numbers allowed)
 * and prevent abusive English and Hindi (Hinglish + Devanagari) words.
 */

// 1. Phone number & Excessive Digits:
// Matches 5 or more consecutive or symbol/space-separated digits (ASCII 0-9 & Devanagari ०-९)
// e.g. 8769959424, 87699, 8 7 6 9 9, 8-7-6-9-9, 8.7.6.9.9 are blocked.
// 8769 (4 digits) or less are allowed.
const PHONE_PATTERN = /(?:[\d०-९][^\p{L}\p{N}]*){5,}/u;

// Number words sequence of 5 or more (e.g. "nine eight seven six five" or "ek do teen char paanch")
const NUMBER_WORDS = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'shunya', 'ek', 'do', 'teen', 'char', 'chaar', 'paanch', 'panch', 'chhe', 'chhah', 'che', 'saat', 'aath', 'nau', 'das'
];
const NUMBER_WORDS_REGEX = new RegExp(`(?:\\b(?:${NUMBER_WORDS.join('|')})\\b[\\s,.-]*){5,}`, 'i');

/**
 * Checks if text contains a phone number or 5+ digits
 * @param {string} text 
 * @returns {boolean}
 */
export const containsPhoneNumber = (text) => {
    if (!text) return false;
    if (PHONE_PATTERN.test(text)) return true;
    if (NUMBER_WORDS_REGEX.test(text)) return true;
    return false;
};

// 2. Abusive / Profanity Word Dictionaries

const ENGLISH_ABUSIVE = [
    'fuck', 'fucker', 'fucking', 'fucked', 'fuckin', 'fck', 'fuk', 'fuckoff',
    'motherfucker', 'motherfucking', 'mf',
    'bitch', 'bitches', 'bitching', 'bitchy',
    'asshole', 'assholes', 'arsehole',
    'bastard', 'bastards',
    'cunt', 'cunts',
    'dick', 'dicks', 'dickhead',
    'pussy', 'pussies',
    'cock', 'cocksucker', 'cocks',
    'slut', 'sluts', 'slutty',
    'whore', 'whores',
    'faggot', 'fag',
    'nigger', 'nigga',
    'retard', 'retarded',
    'blowjob', 'handjob'
];

const HINDI_ABUSIVE = [
    'madarchod', 'maderchod', 'madarchodh', 'madarjaat', 'madarchodo', 'mc', 'mkc', 'tmkc', 'maachod',
    'behenchod', 'bhenchod', 'behnchod', 'bhenchodd', 'bc', 'bkl',
    'bhosdike', 'bhosdi', 'bhosdiwale', 'bhosadike', 'bhosada', 'bhosda', 'bsdk',
    'chutiya', 'chutiye', 'chootiya', 'chutiyapa', 'chutya', 'chutia', 'chootiye',
    'chut', 'choot',
    'gandu', 'gaandu', 'gandmasti', 'gandfat', 'gaand',
    'lund', 'lauda', 'loda', 'lawda', 'louda', 'lodha', 'lodu',
    'randi', 'raand', 'randwa', 'randibaaz', 'randwe',
    'harami', 'haramzada', 'haramzade', 'haramkhor',
    'kamina', 'kamini', 'kamine',
    'kutta', 'kutti', 'kutte',
    'suar', 'suwar', 'suwarkebache',
    'chod', 'chodu', 'chodna', 'chudai', 'chudva', 'chudwa',
    'jhaat', 'jhatu', 'jhat',
    'tatte', 'tatta', 'tatton',
    'chuchi', 'chuchiya', 'chuchiyan',
    'muth', 'muthal', 'muthiya',
    'bhadva', 'bhadwe', 'bhadwa', 'bhadve',
    'chinal'
];

const DEVANAGARI_ABUSIVE = [
    'मादरचोद', 'मदरचोद', 'मादरजात', 'माचोद',
    'बहनचोद', 'भेनचोद', 'बेहेनचोद',
    'भोसड़ीके', 'भोसड़ी', 'भोसड़ीवाले', 'भोसड़ा',
    'चूतिया', 'चूतिये', 'चूत', 'चूतियापा',
    'गांड', 'गांडू',
    'लंड', 'लौड़ा', 'लौड़े', 'लोड़ा', 'लोड़े',
    'रंडी', 'रांड', 'रंडवा',
    'हरामी', 'हरामज़ादा', 'हरामज़ादे', 'हरामखोर',
    'कमीना', 'कमीनी', 'कमीने',
    'कुत्ता', 'कुत्ती', 'कुत्ते',
    'चोदू', 'चोदना', 'चुदाई',
    'झांट', 'झाटू',
    'टट्टे', 'टट्टा',
    'चूची', 'चूचियां',
    'मुठ', 'मुट्ठल',
    'भाड़वा', 'भाड़वे',
    'सूअर', 'छिनाल'
];

/**
 * Normalizes text to catch obfuscated / leetspeak words
 * @param {string} text 
 * @returns {string}
 */
const normalizeText = (text) => {
    if (!text) return '';
    let normalized = text.toLowerCase();

    // Replace leetspeak substitutions
    normalized = normalized
        .replace(/@/g, 'a')
        .replace(/\$/g, 's')
        .replace(/!/g, 'i')
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/\*/g, '');

    // Collapse repeated characters to max 2: e.g. "fuuuck" -> "fuuck", "chuuutiya" -> "chuutiya"
    normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
    return normalized;
};

// Build regex patterns with word boundaries
const ALL_LATIN_WORDS = [...ENGLISH_ABUSIVE, ...HINDI_ABUSIVE];
const LATIN_ABUSIVE_REGEX = new RegExp(`\\b(${ALL_LATIN_WORDS.join('|')})\\b`, 'i');

/**
 * Checks if text contains abusive English or Hindi words
 * @param {string} text 
 * @returns {boolean}
 */
export const containsAbusiveContent = (text) => {
    if (!text) return false;

    // Check Devanagari directly
    for (const badWord of DEVANAGARI_ABUSIVE) {
        if (text.includes(badWord)) return true;
    }

    // Check Latin/English/Hinglish on normalized text
    const normalized = normalizeText(text);
    if (LATIN_ABUSIVE_REGEX.test(normalized)) {
        return true;
    }

    // Check with single repeated characters collapsed (e.g. "fuuck" -> "fuck")
    const collapsed = normalized.replace(/(.)\1+/g, '$1');
    if (LATIN_ABUSIVE_REGEX.test(collapsed)) {
        return true;
    }

    return false;
};

/**
 * Validates a message content against phone numbers and profanity
 * @param {string} content 
 * @returns {{ isValid: boolean, reason?: string, message?: string }}
 */
export const validateMessageContent = (content) => {
    if (!content || typeof content !== 'string') {
        return { isValid: true };
    }

    if (containsPhoneNumber(content)) {
        return {
            isValid: false,
            reason: 'phone_number',
            message: 'Sharing phone numbers or sequences of 5 or more digits is not allowed (maximum 4 numbers allowed at a time).'
        };
    }

    if (containsAbusiveContent(content)) {
        return {
            isValid: false,
            reason: 'abusive_language',
            message: 'Abusive or offensive language is strictly not allowed.'
        };
    }

    return { isValid: true };
};

