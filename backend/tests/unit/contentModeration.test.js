import { validateMessageContent, containsPhoneNumber } from '../../src/utils/contentModeration.js';

describe('Content Moderation Utilities', () => {
    describe('Phone Number Blocking', () => {
        test('blocks standard 10-digit Indian phone numbers', () => {
            expect(containsPhoneNumber('call me at 9876543210')).toBe(true);
            expect(validateMessageContent('9876543210').isValid).toBe(false);
        });

        test('blocks spaced out or symbol-separated phone numbers', () => {
            expect(containsPhoneNumber('9 8 7 6 5 4 3 2 1 0')).toBe(true);
            expect(containsPhoneNumber('9-8-7-6-5')).toBe(true);
            expect(containsPhoneNumber('9.8.7.6.5')).toBe(true);
        });

        test('blocks number words spelled out in words', () => {
            expect(containsPhoneNumber('nine eight seven six five')).toBe(true);
            expect(containsPhoneNumber('nau aath saat chhe paanch')).toBe(true);
        });

        test('allows up to 4 digits (e.g. year, short amount, time)', () => {
            expect(containsPhoneNumber('meet at 1200')).toBe(false);
            expect(containsPhoneNumber('year 2026')).toBe(false);
            expect(validateMessageContent('born in 1999').isValid).toBe(true);
        });
    });

    describe('Abusive / Profanity Detection', () => {
        test('blocks explicit English profanity', () => {
            expect(validateMessageContent('you are an asshole').isValid).toBe(false);
            expect(validateMessageContent('fuck this').isValid).toBe(false);
        });

        test('allows polite conversational messages', () => {
            expect(validateMessageContent('Hey, how are you?').isValid).toBe(true);
            expect(validateMessageContent('Aap kaise ho?').isValid).toBe(true);
            expect(validateMessageContent('Khana khaya?').isValid).toBe(true);
        });
    });
});

