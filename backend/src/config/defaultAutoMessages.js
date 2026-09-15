/**
 * Default Auto Message Templates
 * @owner: Sujal (User Domain)
 * @purpose: Predefined auto-message templates for female users
 */

export const DEFAULT_AUTO_MESSAGES = [
    {
        name: 'Cute Smile',
        content: 'Hi… तुम्हारी smile really cute है 😊',
    },
    {
        name: 'Interesting Vibe',
        content: 'Honestly, तुम काफ़ी interesting लग रहे हो 😉',
    },
    {
        name: 'Intentional Hello',
        content: 'Random नहीं है ये hello, थोड़ा intentional है 😌',
    },
    {
        name: 'Profile Attention',
        content: 'तुम्हारी profile ने मेरा attention grab कर लिया 😏',
    },
    {
        name: 'First Move',
        content: 'Socha पहले मैं ही hi बोल दूँ 👀',
    },
    {
        name: 'Want to Talk',
        content: 'तुमसे बात करने का मन हो गया, that\'s why message किया 😄',
    },
    {
        name: 'Good Vibe',
        content: 'Hey… तुम्हारी vibe really अच्छी लग रही है.',
    },
    {
        name: 'Pretty Cute',
        content: 'Sach बताऊँ? तुम pretty cute लग रहे हो 😊',
    },
    {
        name: 'Something Special',
        content: 'ऐसे ही नहीं लिखा, something special लगा 😉',
    },
    {
        name: 'Let\'s Talk',
        content: 'तुम interesting हो, let\'s talk 😊',
    },
];

/**
 * Get a random default template
 */
export function getRandomDefaultTemplate() {
    const randomIndex = Math.floor(Math.random() * DEFAULT_AUTO_MESSAGES.length);
    return DEFAULT_AUTO_MESSAGES[randomIndex];
}
