import smartReplyEngine, { detectGibberish } from '../../src/services/ai/smartReplyEngine.js';

describe('SmartReplyEngine Unit Tests', () => {
    const mockCompanion = {
        name: 'Ishita',
        age: 22,
        occupation: 'Content Creator',
        city: 'Indore',
    };
    const mockUser = {
        profile: { name: 'Rahul' }
    };

    describe('Gibberish Detection', () => {
        test('identifies keyboard mash and consecutive consonants as gibberish', () => {
            expect(detectGibberish('asdfghjkl').isGibberish).toBe(true);
            expect(detectGibberish('zzzzzzzz').isGibberish).toBe(true);
            expect(detectGibberish('??????').isGibberish).toBe(true);
        });

        test('identifies real conversational sentences as valid text', () => {
            expect(detectGibberish('Hey, how are you doing today?').isGibberish).toBe(false);
            expect(detectGibberish('kya kar rahi ho').isGibberish).toBe(false);
            expect(detectGibberish('नमस्ते कैसी हो').isGibberish).toBe(false);
            expect(detectGibberish('ok').isGibberish).toBe(false);
            expect(detectGibberish('hmm').isGibberish).toBe(false);
        });
    });

    describe('AI Identity Denial', () => {
        const aiQuestions = [
            'are you an ai?',
            'are you a bot?',
            'kya tum ai ho?',
            'kya tum robot ho?',
            'kya tum bot ho?',
            'are you real or ai?',
        ];

        aiQuestions.forEach((q) => {
            test(`denies being AI when asked: "${q}"`, () => {
                const reply = smartReplyEngine.generateReply({
                    userMessage: q,
                    companion: mockCompanion,
                    user: mockUser,
                });
                expect(reply).toBeDefined();
                expect(reply.length).toBeGreaterThan(5);
                // Must not say "I am an AI" or "AI companion"
                expect(reply.toLowerCase()).not.toContain('i am an ai');
                expect(reply.toLowerCase()).not.toContain('smart ai dost');
                expect(reply.toLowerCase()).not.toContain('main ek ai');
                // Must assert human or natural identity and deny bot/AI
                const assertsHuman =
                    /nahi|real|human|ladki|asli|robot|insaan|इंसान|रोबोट|नहीं/i.test(reply) &&
                    !/i am an ai|smart ai dost|main ek ai|i'm an ai/i.test(reply);
                expect(assertsHuman).toBe(true);
            });
        });
    });

    describe('Contextual Food & Home Invitations', () => {
        test('recognizes home and food invitation like "ghar par pohe aana"', () => {
            const reply = smartReplyEngine.generateReply({
                userMessage: 'mere ghar par khane pohe aana',
                companion: mockCompanion,
                user: mockUser,
            });
            expect(reply.toLowerCase()).toMatch(/poha|pohe|ghar|khila|banao/i);
        });

        test('recognizes general food hunger mention', () => {
            const reply = smartReplyEngine.generateReply({
                userMessage: 'bahut bhook lagi hai kya khaye',
                companion: mockCompanion,
                user: mockUser,
            });
            expect(reply.toLowerCase()).toMatch(/khana|khaya|food|bhook|order|banaya|zomato/i);
        });
    });

    describe('Language Script Detection and Mirroring', () => {
        test('replies in Devanagari script when user writes in Hindi', () => {
            const reply = smartReplyEngine.generateReply({
                userMessage: 'नमस्ते कैसी हो आप?',
                companion: mockCompanion,
                user: mockUser,
                persona: { languageStyle: 'hindi' },
            });
            // Should contain Devanagari characters
            expect(/[\u0900-\u097F]/.test(reply)).toBe(true);
        });

        test('replies in English when user writes in English and persona is English', () => {
            const reply = smartReplyEngine.generateReply({
                userMessage: 'Hello, how was your weekend?',
                companion: mockCompanion,
                user: mockUser,
                persona: { languageStyle: 'english' },
            });
            expect(reply).toBeDefined();
            // Should be in Latin alphabet
            expect(/[a-zA-Z]/.test(reply)).toBe(true);
        });

        test('replies in Hinglish for casual Indian Roman text', () => {
            const reply = smartReplyEngine.generateReply({
                userMessage: 'aaj ka din kaisa tha?',
                companion: mockCompanion,
                user: mockUser,
                persona: { languageStyle: 'hinglish' },
            });
            expect(reply).toBeDefined();
            expect(reply.length).toBeGreaterThan(10);
        });
    });

    describe('Compliments and Flirting', () => {
        test('responds warmly to compliments like "you are beautiful"', () => {
            const reply = smartReplyEngine.generateReply({
                userMessage: 'you look so pretty and cute',
                companion: mockCompanion,
                user: mockUser,
            });
            expect(reply.toLowerCase()).toMatch(/blush|aww|thank|cute|sweet|taareef/i);
        });
    });
});
