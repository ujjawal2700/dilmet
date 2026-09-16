/**
 * Legal Documents Content
 * @purpose: Static content for Dil Mate's Terms of Service, Privacy Policy,
 *           Community Guidelines, and Platform Rules - rendered by
 *           LegalDocumentPage.tsx via a route slug.
 *
 * NOTE: This is a first draft written to accurately describe how the app
 * actually behaves (coin economy, Aadhaar verification, content moderation,
 * etc.), not generic boilerplate. It has not been reviewed by a lawyer -
 * have it reviewed before relying on it for a live, paying user base.
 */

export interface LegalSection {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
}

export interface LegalDocument {
    slug: string;
    title: string;
    icon: string;
    lastUpdated: string;
    intro?: string;
    sections: LegalSection[];
}

const LAST_UPDATED = 'September 16, 2026';

export const legalDocuments: Record<string, LegalDocument> = {
    'terms-of-service': {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        icon: 'gavel',
        lastUpdated: LAST_UPDATED,
        intro:
            'These Terms of Service ("Terms") govern your access to and use of Dil Mate (the "App", "we", "us"). By creating an account, you agree to these Terms. If you do not agree, please do not use the App.',
        sections: [
            {
                heading: '1. Eligibility',
                bullets: [
                    'You must be at least 18 years old to create an account or use Dil Mate.',
                    'You must provide a valid phone number and complete our OTP verification to register.',
                    'Female users must additionally submit a government-issued Aadhaar card for identity verification before their profile is approved and made visible to other users.',
                    'You may not create more than one account, and you may not create an account on behalf of someone else without their permission.',
                ],
            },
            {
                heading: '2. Your Account',
                paragraphs: [
                    'You are responsible for all activity that occurs under your account. Keep your device and phone number secure - anyone who can receive your OTP can access your account.',
                    'We may suspend or permanently block an account at our discretion, including for violations of these Terms, our Community Guidelines, or applicable law. If your account is blocked by an administrator, you will be notified of the reason where reasonably possible.',
                ],
            },
            {
                heading: '3. Coins, Payments, and In-App Purchases',
                paragraphs: [
                    'Dil Mate uses an in-app virtual currency ("Coins") purchased with real money through our payment partner, Razorpay. Coin prices and package sizes are set by us and may change at any time.',
                ],
                bullets: [
                    'Coins are consumed for actions such as sending a message, sending a "Hi" greeting, sending an image, sending a gift, and making a video or voice call. The coin cost of each action is configurable by us and may change without prior notice.',
                    'Coins have no cash value outside the App and cannot be transferred, gifted, or exchanged between accounts, except through in-App features (such as gifting) explicitly designed for that purpose.',
                    'Coin purchases are generally non-refundable once completed, except where required by applicable consumer protection law, or where a payment was processed in error (e.g. charged but coins not credited due to a technical fault).',
                    'If a payment is deducted but coins are not credited to your account due to a verified technical error, contact support and we will investigate and correct the balance.',
                ],
            },
            {
                heading: '4. Earning Coins and Withdrawals',
                paragraphs: [
                    'Female users may earn Coins by receiving messages, gifts, and calls from other users, by participating in the referral program, and by completing daily tasks where offered. Earned Coins may be withdrawn as real money, subject to the minimum withdrawal amount, payout slabs, and processing timelines set out in the App at the time of the request.',
                    'We reserve the right to review withdrawal requests for fraud or abuse (including fake engagement, bot activity, or coordinated coin-farming) before releasing payment, and to decline or reverse a withdrawal where such activity is confirmed.',
                ],
            },
            {
                heading: '5. Referral Program & Daily Tasks',
                paragraphs: [
                    'Where offered, the referral program and daily tasks award bonus Coins for specific actions (such as a referred friend completing their first recharge, or completing a daily task like messaging a set number of users). Reward amounts, targets, and eligibility rules are configurable by us and may change at any time. Daily task progress resets every day at 12:00 AM IST. Attempting to abuse these programs (e.g. self-referral, fake accounts, or automated task completion) is a violation of these Terms and may result in forfeiture of rewards and account suspension.',
                ],
            },
            {
                heading: '6. Acceptable Use',
                paragraphs: [
                    'You agree to use Dil Mate only for its intended purpose - meeting and communicating with other real people in good faith. See our Community Guidelines for detailed conduct rules, which are part of these Terms.',
                ],
            },
            {
                heading: '7. Content You Submit',
                paragraphs: [
                    'You retain ownership of the photos, messages, and other content you submit ("User Content"). By submitting User Content, you grant us a limited, non-exclusive license to host, store, display, and transmit it as necessary to operate the App (for example, showing your profile photo to other users, or delivering your messages to their recipient).',
                    'You are solely responsible for your User Content and confirm you have the right to share it. Do not upload content that infringes someone else\'s rights, impersonates another person, or violates our Community Guidelines.',
                ],
            },
            {
                heading: '8. Automated Content Checks',
                paragraphs: [
                    'To help keep conversations on-platform and safe, messages are automatically screened before sending. Messages containing phone numbers or sequences of 5 or more digits (a maximum of 4 consecutive digits is allowed), or containing abusive or offensive language, will be blocked and not delivered. This screening is automated and may occasionally be over- or under-inclusive; contact support if you believe a message was blocked in error.',
                ],
            },
            {
                heading: '9. Termination',
                paragraphs: [
                    'You may stop using the App at any time and request deletion of your account from your Settings. We may suspend or terminate your access immediately if you violate these Terms, our Community Guidelines, or applicable law, or if we reasonably believe your account poses a risk to other users or to the platform.',
                    'Coins remaining in a terminated account are forfeited, except where a pending withdrawal was already validly requested prior to termination.',
                ],
            },
            {
                heading: '10. Disclaimers & Limitation of Liability',
                paragraphs: [
                    'Dil Mate is a platform that helps people connect - we do not conduct criminal background checks on users beyond the identity verification described in these Terms, and we cannot guarantee the identity, intentions, or conduct of any user. You are responsible for exercising your own judgment and caution, especially before sharing personal information or meeting anyone in person.',
                    'The App is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the App, including damages arising from your interactions with other users.',
                ],
            },
            {
                heading: '11. Changes to These Terms',
                paragraphs: [
                    'We may update these Terms from time to time. Material changes will be reflected by updating the "Last updated" date below. Continued use of the App after changes take effect constitutes acceptance of the revised Terms.',
                ],
            },
            {
                heading: '12. Governing Law',
                paragraphs: [
                    'These Terms are governed by the laws of India. Any disputes arising under these Terms will be subject to the exclusive jurisdiction of the courts located in India.',
                ],
            },
            {
                heading: '13. Contact Us',
                paragraphs: [
                    'Questions about these Terms can be sent to our support team via the contact details listed in the App\'s About section.',
                ],
            },
        ],
    },

    'privacy-policy': {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        icon: 'shield_lock',
        lastUpdated: LAST_UPDATED,
        intro:
            'This Privacy Policy explains what personal data Dil Mate collects, why we collect it, how it is used and protected, and the choices you have. By using the App, you agree to the collection and use of information as described here.',
        sections: [
            {
                heading: '1. Information We Collect',
                paragraphs: ['We collect the following categories of information:'],
                bullets: [
                    'Account information: your phone number (used for OTP login and as your primary identifier), and your date of birth (used to confirm you are 18+).',
                    'Profile information: your name, age, gender, bio, interests, and the photos you upload.',
                    'Identity verification (female users only): a photo of your Aadhaar card, uploaded during signup. This is used solely to verify identity and combat fake profiles, and is reviewed as part of our approval process for female accounts.',
                    'Location: your city/general location if you choose to share it, and approximate geolocation coordinates used to show you nearby matches, where permission is granted.',
                    'Communications: messages, "Hi" greetings, gifts, and call metadata (such as call duration) exchanged with other users through the App.',
                    'Payment information: transaction records for Coin purchases and withdrawals. Card and payment details themselves are collected and processed directly by our payment processor, Razorpay - we do not store your full card or bank details on our servers.',
                    'Device and usage data: device type, app version, push-notification tokens (via Firebase Cloud Messaging), IP address, and general usage/interaction data (such as which features you use).',
                ],
            },
            {
                heading: '2. How We Use Your Information',
                bullets: [
                    'To create and operate your account, including OTP-based login and session security.',
                    'To verify the identity of female users, as a safety measure for the community, prior to profile approval.',
                    'To show your profile to compatible users and show you potential matches, including by approximate distance where location is shared.',
                    'To operate the coin economy: processing purchases, deducting coin costs for messages/gifts/calls, crediting earnings, and processing withdrawal requests.',
                    'To screen messages for phone numbers and abusive language, in order to keep the community safe and conversations on-platform (see our Terms of Service, Section 8).',
                    'To send you push notifications about messages, matches, rewards, and account activity - you can control this from your device or app notification settings.',
                    'To detect and prevent fraud, abuse of the referral or task-reward systems, and violations of our Terms or Community Guidelines.',
                    'To respond to support requests and enforce reports made against other users.',
                ],
            },
            {
                heading: '3. Who We Share Data With',
                paragraphs: [
                    'We do not sell your personal data. We share information only as needed to operate the App:',
                ],
                bullets: [
                    'Other users: your profile (name, age, photos, bio) is visible to other users of the App as intended by the service. Your phone number is never shown to other users.',
                    'Razorpay (payment processor): to process Coin purchases and withdrawals.',
                    'Cloud infrastructure providers: your photos and Aadhaar document are stored securely with our cloud media provider (Cloudinary); app data is stored on MongoDB Atlas; push notifications are delivered via Firebase Cloud Messaging.',
                    'Law enforcement or regulators: where required by valid legal process, or to protect the rights, safety, or property of Dil Mate, our users, or the public.',
                ],
            },
            {
                heading: '4. Aadhaar & Sensitive Data Handling',
                paragraphs: [
                    'Aadhaar card images submitted for female-account verification are used exclusively for identity verification purposes and are not displayed to other users or made public at any point. Access is restricted to the verification/approval process. If you would like your verification document deleted after your account has been approved or if you close your account, contact support to request deletion, subject to any legal retention requirements.',
                ],
            },
            {
                heading: '5. Data Retention',
                paragraphs: [
                    'We retain your account and profile data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within a reasonable period, except where we are required to retain certain records (such as transaction records) for legal, tax, or fraud-prevention purposes.',
                ],
            },
            {
                heading: '6. Your Choices & Rights',
                bullets: [
                    'You can review and edit most of your profile information at any time from your profile page.',
                    'You can delete your account from Settings; this initiates deletion of your personal data as described above.',
                    'You can block other users, which prevents them from contacting you and hides your profile from them.',
                    'You can control push notification permissions through your device settings.',
                    'You may request a copy of the personal data we hold about you, or request its correction or deletion, by contacting support.',
                ],
            },
            {
                heading: '7. Data Security',
                paragraphs: [
                    'We use industry-standard measures to protect your data, including encrypted connections (HTTPS), access-controlled cloud storage, and secure authentication. No system is 100% secure, and we cannot guarantee absolute security, but we work to protect your information and to respond quickly if an issue is identified.',
                ],
            },
            {
                heading: '8. Children\'s Privacy',
                paragraphs: [
                    'Dil Mate is strictly for users aged 18 and older. We do not knowingly collect data from anyone under 18. If we become aware that an underage user has created an account, we will terminate the account and delete the associated data.',
                ],
            },
            {
                heading: '9. Changes to This Policy',
                paragraphs: [
                    'We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date below. We encourage you to review this page periodically.',
                ],
            },
            {
                heading: '10. Contact Us',
                paragraphs: [
                    'For privacy questions, data requests, or concerns, contact our support team via the contact details listed in the App\'s About section.',
                ],
            },
        ],
    },

    'community-guidelines': {
        slug: 'community-guidelines',
        title: 'Community Guidelines',
        icon: 'diversity_3',
        lastUpdated: LAST_UPDATED,
        intro:
            'Dil Mate exists to help people build genuine connections. These guidelines describe the behavior we expect from everyone in the community, and what happens if they\'re broken.',
        sections: [
            {
                heading: 'Be Respectful',
                bullets: [
                    'Treat every person you interact with courteously, even if a conversation doesn\'t lead anywhere.',
                    'No harassment, threats, hate speech, or discriminatory language based on race, religion, caste, gender, sexual orientation, disability, or any other protected characteristic.',
                    'No sexually explicit, obscene, or unsolicited explicit content.',
                    'Take "no" for an answer. If someone stops responding or asks you to stop contacting them, respect that.',
                ],
            },
            {
                heading: 'Be Authentic',
                bullets: [
                    'Use your own recent photos. Do not use photos of someone else, celebrities, stock images, or AI-generated images that misrepresent who you are.',
                    'Do not create fake, duplicate, or impersonation accounts.',
                    'Your profile information (age, name, bio) should be truthful.',
                ],
            },
            {
                heading: 'Keep Conversations On-Platform & Coin-Fair',
                paragraphs: [
                    'To protect users from scams and keep the platform fair for everyone, our messaging system automatically blocks messages that contain phone numbers or sequences of 5 or more digits (up to 4 digits at a time is allowed for things like ages or short codes). This is an enforced, automated rule, not a suggestion.',
                ],
                bullets: [
                    'Do not attempt to move conversations to other apps or numbers to bypass the App\'s coin-based messaging system.',
                    'Do not ask other users for money, gifts, or financial help outside of the App\'s built-in gifting features - this is one of the most common dating-app scam patterns, and we take it seriously.',
                    'Do not offer or solicit paid services, sponsorships, advertising, or promotional content through chat.',
                ],
            },
            {
                heading: 'No Scams or Financial Exploitation',
                bullets: [
                    'Never send money, gift cards, cryptocurrency, or banking details to someone you\'ve met on Dil Mate, no matter how convincing their story is.',
                    'Do not attempt to farm coins through fake engagement, bot accounts, self-referrals, or automated messaging.',
                    'Report any user who asks you for money, investment "opportunities," or your financial/banking information.',
                ],
            },
            {
                heading: 'Safety First',
                bullets: [
                    'If you choose to meet someone in person, meet in a public place and tell a friend or family member where you\'re going.',
                    'Never share your home address, financial details, or government ID numbers over chat.',
                    'If a conversation makes you uncomfortable, use the Block and Report features - you don\'t owe anyone an explanation.',
                ],
            },
            {
                heading: 'Prohibited Content',
                bullets: [
                    'Nudity or sexually explicit images or messages sent without consent.',
                    'Content promoting violence, self-harm, or illegal activity.',
                    'Spam, chain messages, or mass unsolicited promotional content.',
                    'Content that violates someone else\'s intellectual property or privacy.',
                ],
            },
            {
                heading: 'Reporting & Enforcement',
                paragraphs: [
                    'If someone violates these guidelines, use the Report option on their profile or in the chat. Our team reviews reports and takes action ranging from a warning to a permanent, immediate ban, depending on severity. Repeated or serious violations (scams, harassment, underage use, impersonation) typically result in immediate account termination without warning.',
                ],
            },
        ],
    },

    'platform-rules': {
        slug: 'platform-rules',
        title: 'Platform Rules',
        icon: 'rule',
        lastUpdated: LAST_UPDATED,
        intro:
            'These are the specific operating rules for using Dil Mate\'s features - how accounts, coins, calls, and rewards actually work. They apply alongside our Terms of Service and Community Guidelines.',
        sections: [
            {
                heading: 'Accounts',
                bullets: [
                    'One account per person. Multiple accounts from the same person may be merged or suspended.',
                    'Minimum age is 18. Age is calculated from the date of birth provided at signup.',
                    'Female accounts require Aadhaar verification and manual approval before the profile becomes visible to other users; you\'ll see your approval status in the app.',
                    'You may edit your profile, photos, and preferences at any time from My Profile.',
                ],
            },
            {
                heading: 'Coin Costs',
                paragraphs: [
                    'Sending a message, a "Hi" greeting, an image, a gift, or making a video or voice call each costs Coins, deducted from the sender\'s balance at the time of the action. Exact costs are set by the platform and shown in the App before you take a costly action where practical (for example, on the incoming-call screen or the coin economy settings). Costs can change - the amount shown in the App at the time of the action is the amount that applies.',
                ],
                bullets: [
                    'Message costs may be a flat per-message rate or a per-word rate, depending on the platform\'s current configuration.',
                    'Video calls and voice calls are billed at a flat per-call rate for a fixed session duration; the call may end automatically when the duration limit is reached.',
                    'If a call fails to connect or is rejected, any Coins locked for that call are refunded automatically.',
                ],
            },
            {
                heading: 'Earning & Withdrawals',
                bullets: [
                    'Female users earn Coins when their messages, gifts, and calls are paid for by the other party.',
                    'Withdrawal requests are subject to a minimum withdrawal amount and a payout percentage/slab structure set by the platform, visible in your Wallet before you submit a request.',
                    'Withdrawal requests are reviewed before payout and may be declined if fraud or abuse is suspected.',
                ],
            },
            {
                heading: 'Referral Program',
                bullets: [
                    'Every user has a unique referral code, shareable with friends.',
                    'When someone signs up using your code and completes their first coin recharge, you receive a reward - the reward amount is set by the platform and shown in the Refer & Earn page.',
                    'Referral rewards are paid once per successful referred recharge, not per signup - a signup alone does not trigger a reward.',
                    'Self-referral, fake accounts, or coordinated referral abuse voids the reward and may result in account action.',
                ],
            },
            {
                heading: 'Daily Tasks',
                bullets: [
                    'Daily tasks (such as checking in, messaging a number of different users, or sending a gift) offer bonus Coins for completing everyday actions - you don\'t need to open the Tasks page to complete them, just use the App normally.',
                    'Task progress and rewards reset every day at 12:00 AM IST.',
                    'Each task can only be rewarded once per day, even if you exceed its target.',
                    'Task types, targets, and reward amounts are configured by the platform and may change.',
                ],
            },
            {
                heading: 'Blocking & Reporting',
                bullets: [
                    'Blocking a user immediately prevents further messages or calls between you and them, in both directions.',
                    'Reporting a user flags their account for review by our moderation team; you can also block them at the same time.',
                    'Accounts found to violate our Community Guidelines may be warned, temporarily restricted, or permanently banned depending on severity.',
                ],
            },
            {
                heading: 'Content Moderation',
                paragraphs: [
                    'Messages are automatically screened before delivery. A message will be blocked (not sent) if it contains a phone number, a sequence of 5 or more digits, or abusive/offensive language. This applies equally to all users and cannot be disabled.',
                ],
            },
        ],
    },
};

export const legalDocumentSlugs = Object.keys(legalDocuments);
