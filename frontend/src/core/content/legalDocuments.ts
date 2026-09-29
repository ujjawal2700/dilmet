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

export const LEGAL_VERSION = '2026-09-29';
const LAST_UPDATED = 'September 29, 2026';

export const legalDocuments: Record<string, LegalDocument> = {
    'terms-of-service': {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        icon: 'gavel',
        lastUpdated: LAST_UPDATED,
        intro:
            'These Terms of Service ("Terms") govern your access to Dil Mate (the "App"). At signup, you must actively accept these Terms. If you do not agree, do not create or use an account.',
        sections: [
            {
                heading: '1. Agreement and Eligibility',
                bullets: [
                    'You must be at least 18 years old, legally able to enter a contract, and not prohibited by law from using the App.',
                    'You must provide a valid phone number, complete OTP verification, give accurate information, and use only your own identity and photos.',
                    'Female profiles must submit an Aadhaar image for the App\'s identity-review process before approval. Approval is not a government endorsement or a criminal-background check.',
                    'The Privacy Policy, Cookie Policy, Community Guidelines and Platform Rules are incorporated into these Terms.',
                ],
            },
            {
                heading: '2. Account and Session Security',
                paragraphs: [
                    'You are responsible for activity on your account and for keeping your device, phone number and OTP secure. Tell support promptly if you suspect unauthorized access. You may not sell, transfer, share or create duplicate accounts.',
                    'We store an authentication token on your device to maintain your login session. Logging out removes the active authentication state on that device.',
                ],
            },
            {
                heading: '3. Coins, Payments, and In-App Purchases',
                paragraphs: [
                    'Dil Mate uses virtual "Coins" purchased through Razorpay. The current price, quantity and applicable charges are shown before payment. Payment credentials are handled by the payment provider, subject to its terms.',
                ],
                bullets: [
                    'Coins may be charged for messages, greetings, images, gifts, audio calls, video calls and other clearly priced features. Rates may change prospectively and are displayed in the App.',
                    'Coins are a limited, revocable App entitlement, not legal tender. They cannot be transferred or redeemed except through an expressly offered earning or withdrawal feature.',
                    'Completed purchases are non-refundable except where required by law or where we confirm a duplicate charge or technical failure. Statutory consumer rights are not excluded.',
                ],
            },
            {
                heading: '4. Earning Coins and Withdrawals',
                paragraphs: [
                    'Eligible users may earn Coins through qualifying interactions or tasks and request a payout when the displayed minimum and other requirements are met. You must provide accurate UPI or bank-account payout details and are responsible for applicable taxes.',
                    'We may delay, decline or reverse rewards or payouts while investigating suspected fraud, bots, fake engagement, self-referrals, chargebacks or coordinated coin farming. We will not deny a valid payout arbitrarily.',
                ],
            },
            {
                heading: '5. User Content and Profile Visibility',
                paragraphs: [
                    'You retain ownership of photos, messages and other content you submit. You grant Dil Mate a worldwide, non-exclusive, royalty-free license to host, copy, process, transmit and display that content only as needed to operate, secure, moderate and improve the App. This license ends when the content is deleted, subject to backups, legal retention and content already delivered to another user.',
                    'Your profile name, age, photos, bio, interests, location or online status may be visible to other users as part of the service. Never upload content you do not have the right to use.',
                ],
            },
            {
                heading: '6. Acceptable Use',
                paragraphs: [
                    'Use the App only to make genuine, lawful connections. You may not harass, threaten, exploit or impersonate anyone; post illegal, hateful or sexually exploitative material; solicit money or paid services; scrape data; reverse engineer the App; evade moderation or coin charges; use bots; or compromise another account. The Community Guidelines contain additional binding rules.',
                ],
            },
            {
                heading: '7. Messages, Calls and Safety',
                paragraphs: [
                    'Audio and video features require microphone or camera permission and use Agora to transmit real-time media. Dil Mate does not intentionally record call audio or video, but stores operational records such as participants, status, timing, duration and coin charges. A participant may still capture a call using their device; do not share anything you want kept private.',
                    'Dil Mate does not conduct criminal background checks and cannot guarantee a user\'s identity, intentions, statements or conduct. Use caution, keep financial and identity information private, meet in public, and use block/report tools when needed.',
                ],
            },
            {
                heading: '8. Moderation, Automated Checks and AI',
                paragraphs: [
                    'Messages may be automatically screened for phone numbers, long digit sequences, abusive language, fraud and rule violations. Automated checks can make mistakes; contact support to request review.',
                    'Clearly identified AI-companion or AI-assisted features generate automated output that may be inaccurate or inappropriate. Do not rely on them for medical, legal, financial or emergency advice. Prompts may be sent to an AI service provider to generate a response.',
                ],
            },
            {
                heading: '9. Third-Party Services',
                paragraphs: [
                    'Features may depend on providers such as Razorpay, Agora, Cloudinary, Firebase, Google Maps, MongoDB hosting, SMS gateways and AI providers. Their own terms and privacy practices may apply. We are not responsible for a third-party service outside our reasonable control, but this does not limit rights that cannot legally be waived.',
                ],
            },
            {
                heading: '10. Suspension, Account Deletion and Termination',
                paragraphs: [
                    'You may request account deletion in Settings. We may restrict or terminate an account for a material breach, unlawful conduct, fraud, safety risk or platform abuse, and will provide a reason or review route where reasonably possible. Remaining purchased Coins and valid pending payouts will be handled under applicable law; fraudulent rewards may be forfeited.',
                ],
            },
            {
                heading: '11. Disclaimers and Liability',
                paragraphs: [
                    'The App is provided on an "as available" basis. We do not promise uninterrupted service, a match, income, or the conduct of another user. To the maximum extent permitted by law, Dil Mate is not liable for indirect or consequential loss. Nothing in these Terms excludes liability or consumer and data-protection rights that cannot lawfully be excluded.',
                ],
            },
            {
                heading: '12. Changes and Electronic Records',
                paragraphs: [
                    'We record the policy version and time accepted at signup. If a material change requires renewed consent, we will provide notice and request it before the affected processing or feature continues. Other changes take effect on the stated update date.',
                ],
            },
            {
                heading: '13. Governing Law, Complaints and Contact',
                paragraphs: [
                    'These Terms are governed by the laws of India. Courts with lawful jurisdiction in India may hear disputes; this clause does not remove any forum or remedy available under mandatory law. First contact support@dilmate.com with your account phone number and a description of the issue so we can investigate.',
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
            'This notice explains, in plain language, which personal data the operator of Dil Mate ("Dil Mate", "we") collects, each purpose for collecting it, who receives it, how long it is kept, and how you can exercise your choices and rights.',
        sections: [
            {
                heading: '1. Data We Collect and Why',
                bullets: [
                    'Account and age data: phone number, OTP records, name, gender, date of birth/age, referral code, and the versions and time of your legal consent. We use these to register and authenticate you, confirm you are 18+, administer referrals, and preserve evidence of your request and consent.',
                    'Profile and matching data: photos, bio, interests, occupation, city, approximate or precise coordinates when you permit location access, preferences, online status and profile activity. We use these to build your profile, recommend nearby or compatible profiles and operate social features.',
                    'Identity document: female applicants submit an Aadhaar image. We use it to review authenticity, deter fake profiles and decide account approval. It is not shown to other users.',
                    'Communications and safety data: messages, greetings, images, gifts, blocks, reports, support tickets and moderation results. We use these to deliver communications, enforce rules, investigate complaints, prevent fraud and protect users.',
                    'Call data: call participants, channel or session identifiers, status, timestamps, duration, technical events and coin charges. Agora processes live audio/video to connect the call; Dil Mate does not intentionally record call media.',
                    'Payments and payouts: order, payment, transaction, coin-balance and refund records. For withdrawals we collect the payout method and UPI ID or bank account holder name, account number, IFSC and bank name. We use these to complete transactions, keep accounts, prevent fraud and meet legal obligations. Razorpay handles payment credentials such as card details.',
                    'Device, session and diagnostics data: authentication tokens, IP address, browser/device information, app version, language, notification settings and Firebase push token, network and error events, and feature interactions. We use these for session continuity, security, notifications, troubleshooting and service improvement.',
                ],
            },
            {
                heading: '2. How We Obtain and Use Consent',
                paragraphs: [
                    'At signup, separate unticked checkboxes ask you to accept the Terms and acknowledge and consent to the purposes in this Privacy Policy. The server records the accepted versions, timestamp, IP address and device/browser information. Required account processing is necessary to provide the service you request; optional browser analytics is controlled separately in Cookie Preferences.',
                    'You can withdraw optional consent through Cookie Preferences and can withdraw account-processing consent by requesting account deletion or emailing support@dilmate.com. Withdrawal does not make earlier lawful processing invalid and may mean we can no longer provide the account. Consent never prevents you from making a complaint or exercising a legal right.',
                ],
            },
            {
                heading: '3. Who Receives Data',
                paragraphs: [
                    'We do not sell personal data. We disclose only the information needed for the stated purpose to:',
                ],
                bullets: [
                    'Other users, who see information intended for your profile and the content you send them. They do not receive your phone number, Aadhaar image or payout details from us.',
                    'Service providers including MongoDB/cloud hosting, Cloudinary media hosting, Firebase notifications, Agora calls, Razorpay payments, an SMS/OTP gateway, Google Maps/geocoding, and configured AI model providers. They process data under their own safeguards and instructions needed to provide each feature.',
                    'Professional advisers, auditors, acquirers or successor operators where reasonably necessary and subject to confidentiality safeguards.',
                    'Courts, law enforcement, regulators or emergency recipients when required by law or reasonably necessary to protect a person, investigate fraud or establish legal claims.',
                ],
            },
            {
                heading: '4. Automated Processing and AI',
                paragraphs: [
                    'Rules may automatically block suspected phone numbers, abusive language or policy violations, calculate rewards and coin charges, rank profiles, or flag suspicious activity. Where a decision significantly affects your account, you may ask support for human review.',
                    'If you use an AI companion or AI-assisted feature, your prompt and relevant conversation context may be sent to the configured AI provider to generate a response. AI output is automated and may be inaccurate. AI accounts should be identified as such.',
                ],
            },
            {
                heading: '5. Storage, Retention and Deletion',
                paragraphs: [
                    'Pending signup data and OTPs expire after about 10 minutes. Your account, profile, communications and media are generally kept while the account is active. The local login session can remain for up to 30 days unless you log out or it expires. Operational backups may take additional time to cycle out.',
                    'When you delete your account, active profile, chat and related service records are deleted or de-identified through our deletion process. A limited deletion/audit record, transaction or payout record, complaint, fraud signal or legal-hold material may be retained for the period reasonably required by tax, accounting, safety, dispute or legal obligations. We then delete or anonymize it. Contact support to request deletion of an identity document after verification, subject to a justified retention need.',
                ],
            },
            {
                heading: '6. Your Choices and Rights',
                bullets: [
                    'Access a summary or copy of your personal data and information about its processing.',
                    'Correct or complete inaccurate profile or account data.',
                    'Request erasure, delete the account in Settings, withdraw consent, or change optional storage choices.',
                    'Turn off location, camera, microphone and notification permissions in device/browser settings; the related feature may stop working.',
                    'Block or report another user and ask for review of a moderation or account decision.',
                    'Use the grievance process and, where applicable, nominate another person to exercise rights in the event of death or incapacity.',
                ],
                paragraphs: [
                    'Email support@dilmate.com with the phone number tied to your account and the request. We may verify your identity before acting. We will acknowledge and respond within the period required by applicable law. You may escalate an unresolved data-protection grievance to the Data Protection Board of India when that remedy is available.',
                ],
            },
            {
                heading: '7. Data Security',
                paragraphs: [
                    'We use controls such as encrypted network connections, OTP authentication, restricted administrative access, provider access controls and monitoring. No service is perfectly secure. If a personal-data breach requires notice, we will notify affected users and the relevant authority in the manner required by law. Never send an OTP, Aadhaar number or bank credentials in chat.',
                ],
            },
            {
                heading: '8. International Processing',
                paragraphs: [
                    'Some providers may process or support data from locations outside your state or India. We use providers and safeguards appropriate to the service and will comply with applicable transfer restrictions. Contact support for more information about a relevant provider.',
                ],
            },
            {
                heading: '9. Adults Only',
                paragraphs: [
                    'Dil Mate is only for people aged 18 or older. If we learn that an underage person created an account, we will restrict it and delete the associated data, subject to safety and legal retention needs. Report a suspected underage account to support.',
                ],
            },
            {
                heading: '10. Cookies and Similar Storage',
                paragraphs: [
                    'The App uses browser storage for authentication tokens, language, preferences, security and offline reliability. Optional analytics is not activated unless you allow it and it is configured. See the Cookie Policy and use Cookie Preferences to change the optional choice.',
                ],
            },
            {
                heading: '11. Changes and Contact',
                paragraphs: [
                    'We will update the date and version when this notice changes and will request renewed consent when legally required. For privacy requests, withdrawal or grievances, contact the Dil Mate privacy/grievance contact at support@dilmate.com. Include the account phone number and enough detail to investigate, but never email your OTP or full payment credentials.',
                ],
            },
        ],
    },

    'cookie-policy': {
        slug: 'cookie-policy',
        title: 'Cookie & Storage Policy',
        icon: 'cookie',
        lastUpdated: LAST_UPDATED,
        intro:
            'Dil Mate uses cookies and similar browser technologies such as local storage, session storage, IndexedDB and service-worker storage. This page explains what they do and how to control optional use.',
        sections: [
            {
                heading: '1. Essential Storage',
                paragraphs: [
                    'Essential storage is required to provide the service you request and cannot be disabled inside the App. It maintains your authentication token and session, cached account state, selected language, security state, cookie preference, notification configuration and reliable/offline request queues. The App may not sign in or function correctly if you block or erase it.',
                ],
            },
            {
                heading: '2. Optional Analytics',
                paragraphs: [
                    'Optional analytics would help measure feature use and diagnose performance. No optional analytics service is currently active in this build. Selecting “Accept all” records permission for configured analytics under this policy; if the purpose or providers materially change, we will update the consent version and ask again. We do not use this choice to authorize advertising or cross-site tracking.',
                ],
            },
            {
                heading: '3. Feature Providers',
                paragraphs: [
                    'When you use a feature, integrated providers such as Razorpay, Google Maps, Firebase or Agora may use their own short-lived storage or identifiers for payment security, maps, notifications or calls. Those technologies are triggered by the feature and governed by the relevant provider notice as well as our Privacy Policy.',
                ],
            },
            {
                heading: '4. Retention and Your Controls',
                paragraphs: [
                    'The App login token may remain for up to 30 days. Session items generally last until the tab or session ends; preferences remain until changed, the policy version changes, or browser data is cleared. Provider retention varies by feature.',
                    'Choose “Essential only” in the banner to reject optional analytics, “Accept all” to permit it, or reopen Cookie Preferences from Settings at any time. You can also clear site data in your browser, although doing so signs you out and resets preferences. Withdrawing an optional choice is as easy as granting it.',
                ],
            },
            {
                heading: '5. Contact',
                paragraphs: [
                    'Questions about cookies or browser storage can be sent to support@dilmate.com.',
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
                    'The referral program is available to male users only. Every male user has a unique referral code, shareable with friends.',
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
