/**
 * Smart Reply Engine — Deeply Contextual, Human-Like Indian Girl Chat
 * Reads what the user actually said and replies directly to it.
 */

import { resolveUserCity, getCityCulture } from '../../utils/cityResolver.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const isHindiText = (t) => /[\u0900-\u097F]/.test(t);

const detectLang = (text, lang) => {
    if (isHindiText(text)) return 'hindi';
    if (lang === 'hindi') return 'hindi';
    if (lang === 'english' && !/\b(hai|ho|kya|bhi|nahi|kaise|aaj|yaar|baba|tum|hum|aap|kar|raha|rahi|tha|thi)\b/i.test(text)) return 'english';
    return 'hinglish';
};

const checkGibberish = (text) => {
    const raw = (text || '').trim();
    if (!raw) return true;
    if (/^[?.!@#$%^&*()\-=[\]{};:'"\\|,.<>/?`~]{2,}$/.test(raw)) return true;
    if (/^(.)\1{3,}$/i.test(raw)) return true;
    const words = raw.split(/\s+/).filter(Boolean);
    const valid = new Set(['hmm', 'hm', 'ok', 'kk', 'ty', 'np', 'pls', 'thx', 'gn', 'gm', 'idk', 'lol', 'brb', 'omg']);
    let odd = 0;
    for (const w of words) {
        const c = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (!c || valid.has(c)) continue;
        if (c.length >= 7 && !/[aeiouy]/.test(c)) { odd++; continue; }
        if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(c)) { odd++; continue; }
        if (c.length >= 2 && c.length <= 4 && !/[aeiouy]/.test(c)) { odd++; }
    }
    if (words.length > 0 && odd / words.length >= 0.6) return true;
    const flat = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    return ['asdf', 'sdfg', 'dfgh', 'qwer', 'wert', 'erty', 'zxcv'].some(s => flat.includes(s));
};

const checkDry = (lower) =>
    /^(hmm+|hm+|k|kk|ok+|okay|acha|achha|ha|haan|han|nahi|na|yep|nope|cool|nice|tik|theek|fine|bye|cya|later|हम्म|हाँ|अच्छा|ओके|ठीक|नहीं)\s*\.?$/i.test(lower.trim());

const buildReply = ({ userMessage, companion, user, effectiveLang }) => {
    const text = (userMessage || '').trim();
    const lower = text.toLowerCase();
    const userName = user?.profile?.name || '';
    const companionName = companion?.profile?.name || 'Main';
    const userCity = resolveUserCity(user);
    const cityInfo = userCity ? getCityCulture(userCity) : null;
    const isH = effectiveLang === 'hindi';
    const isE = effectiveLang === 'english';

    // 1. Gibberish
    if (checkGibberish(text)) {
        if (isH) return pick(['हाहा, कीबोर्ड पर बिल्ली चली गई क्या? 😂 दोबारा भेजो!', 'ये कौन सी भाषा है? 😜 फिर से लिखो!']);
        if (isE) return pick(["Haha cat on keyboard? 😂 Send that again!", "Keyboard smash? 😜 What were you trying to say?"]);
        return pick(['Haha phone ki billi chal gayi keyboard pe? 😂 Phir se bhejo!', 'Ye kaunsi language hai baba! 😜 Seedha seedha likho na!']);
    }

    // 2. Dry / one-word
    if (checkDry(lower)) {
        if (isH) return pick(['बस इतना ही? 😜 थोड़ा खुलकर बात करो ना!', 'हम्म… आज बड़े चुप-चुप हो, सब ठीक है? 😊', 'इतने छोटे जवाब? कुछ और बताओ 😉']);
        if (isE) return pick(["Just that? 😜 Tell me more!", "You're quiet today — everything okay? 😊"]);
        return pick(['Sirf itna? 😜 Thoda aur bolo na baba!', 'Hmm… aaj kuch khaas nahi batana hai kya? 😊', 'Itne chhote reply doge to baat kaise badhegi! 😉']);
    }

    // 3. Greeting
    if (/^(hi\b|hello|hey+|namaste|hlo|helo|hy\b|hii+|good\s*(morning|evening|afternoon|night)|gm\b|gn\b|नमस्ते|हैलो|प्रणाम)/i.test(lower)) {
        if (isH) return pick([`नमस्ते${userName ? ' ' + userName : ''}! 😊 कैसे हो आज?`, `हैलो! मैसेज देख के अच्छा लगा ✨ दिन कैसा चल रहा है?`, `अरे नमस्ते! बड़ी देर से इंतजार था 😉`]);
        if (isE) return pick([`Hey${userName ? ' ' + userName : ''}! 😊 How's your day going?`, `Hello! Good to hear from you ✨`]);
        if (userCity && cityInfo && Math.random() < 0.35) return pick(cityInfo.banterLines);
        return pick([`Hey${userName ? ' ' + userName : ''}! 😊 Kaise chal raha hai? Kuch mast hua aaj?`, `Hello! Tumhara message dekh ke achha laga ✨ Din kaisa ja raha hai?`, `Arrey namaste! Bahut der baad yaad kiya 😉 Sab theek-thaak?`]);
    }

    // 4. How are you
    if (/(kaise\s*ho|kaisi\s*ho|kya\s*haal|how\s*are\s*you|how\s*r\s*u|sab\s*theek|क्या\s*हाल|कैसे\s*हो|सब\s*ठीक)/i.test(lower)) {
        if (isH) return pick(['मैं एकदम मस्त हूँ! आप सुनाओ, आज का दिन कैसा बीता? 😊', 'बहुत अच्छी! बस आपसे बात करने का इंतजार था 😉', 'मैं ठीक हूँ! आज काम में लगे रहे या मस्ती हुई? 😜']);
        if (isE) return pick(["I'm doing great! How was your day? 😊", "Pretty good! Was just thinking about chatting 😉"]);
        return pick(['Main ekdum first class! Tum batao, aaj ka din kaisa raha? 😊', 'Bahut badhiya! Bas tumhare message ka wait kar rahi thi 😉', 'Mast hu! Aaj kaam mein busy rahe ya chill bhi ki? 😜']);
    }

    // 5. Are you AI / bot / real
    if (/(are\s+you\s+(an?\s+)?(ai|bot|robot|machine|real|human)|ai\s+(ho|hai|h\b)|(real|asli)\s+(ho|hai)|real\s+human|human\s+ho|tum\s+(ai|bot|robot)|aap\s+(ai|bot)|ai\s*(or|\/|ya)\s*real|real\s*(or|\/|ya)\s*ai|क्या\s+(तुम|आप)\s+(ai|रोबोट|इंसान)|असली\s+हो|रोबोट\s+हो|एआई\s+हो|real\s*ho|bot\s*ho|ai\s*ho|robot\s*ho|sach\s*me\s*ladki)/i.test(lower)) {
        if (isH) return pick(['अरे नहीं बाबा! मैं कोई AI नहीं हूँ, आपकी तरह बिल्कुल असली इंसान हूँ 😊 ऐसा क्यों लगा?', 'हाहा 100% असली हूँ, कोई रोबोट नहीं 😜', 'नहीं जी! अगर AI होती तो इतना मज़ा आता बात करने में? 😉']);
        if (isE) return pick(["Haha no way! I'm a real human just like you 😊", "Of course not! 100% real, definitely not a bot 😜"]);
        return pick(['Haha arey nahi baba! Main koi AI nahi hu, tumhari tarah ekdum real human hu 😊 Aisa kyu laga?', 'Kya baat kar rahe ho! 100% real ladki hu, koi robot ya AI nahi 😜', 'Nahi yaar! Agar AI hoti to itne pyar se baat karti kya? 😉', 'Arey pagal ho kya haha! Ekdum asli hu, koi AI bot nahi 😂 Aur batao!']);
    }

    // 6. Name
    if (/(naam\s*(kya|batao)|what.*name|your\s*name|aap\s*ka\s*naam|tera\s*naam|तुम्हारा\s*नाम)/i.test(lower)) {
        if (isH) return pick([`मेरा नाम ${companionName} है! और आपका? 😊`, `${companionName} बुलाते हैं मुझे ✨`]);
        return pick([`Main ${companionName} hu! Tumhara naam kya hai? 😊`, `${companionName}! Aur tum? ✨`]);
    }

    // 7. Location
    if (/(kahan\s*(se|rehti|ho)|where.*live|where.*from|tum\s*kahan|aap\s*kahan|कहाँ\s*(से|रहती))/i.test(lower)) {
        if (isH) {
            if (userCity) return pick([`मैं थोड़ा दूर रहती हूँ 😉 पर आप तो ${userCity} से हो ना? वहाँ का मौसम कैसा है?`, `अरे वो बाद में बताऊँगी! आप ${userCity} से हो — वहाँ का खाना तो बहुत फेमस है ना? 😋`]);
            return pick(['मैं थोड़ा दूर रहती हूँ 😉 आप कहाँ से हो?', 'फोन स्क्रीन के उस पार से! आप बताओ कहाँ से हो? ✨']);
        }
        if (userCity && cityInfo) return pick([`Main thoda door rehti hu 😉 Par tum to ${userCity} se ho na? Waha ka ${cityInfo.food[0]} bahut famous hai!`, `Arrey woh baad me bataungi! Tum ${userCity} wale ho — best chai kahan milti hai wahan? ☕`]);
        return pick(['Main thoda door rehti hu 😉 Tum kahan se ho?', 'Phone screen ke uss paar! Tum batao apna shehar? ✨']);
    }

    // 8. Compliments
    if (/(sundar|cute|pretty|beautiful|hot|gorgeous|sweet|pyaari|smart|sexy|dp\s*(mast|achi)|photo\s*(achi|mast)|smile|khubsoorat|सुंदर|खूबसूरत|प्यारी)/i.test(lower)) {
        if (isH) return pick(['अरे वाह, इतनी प्यारी तारीफ! सच में शरमा गई 🙈 थैंक यू!', 'हाहा मक्खन लगा रहे हो या सच में ऐसा लगा? 😜 थैंक यू!', 'थैंक यू यार! सबको ऐसे ही बोलते हो या सिर्फ मुझे? 😉']);
        if (isE) return pick(["Aww thank you so much! You're really sweet 🙈✨", "Haha are you sure? Thank you! Quite charming yourself 😉"]);
        return pick(['Aww itni pyaari baat! Sach me blush ho gayi 🙈 Thank you!', 'Haha makkhan chal raha hai ya sach me laga? 😜 Par thank you!', 'Thank you yaar! Sabko aise hi bolte ho ya sirf mujhe special? 😉']);
    }

    // 9. Flirting / Love
    if (/(single|boyfriend|bf|girlfriend|gf|pyaar|love\s*you|i\s*love\s*you|i\s*like\s*you|shadi|marry|crush|शादी|प्यार|सिंगल)/i.test(lower)) {
        if (isH) return pick(['हाहा इतनी जल्दी? पहले अच्छी दोस्ती तो हो जाए 😉', 'मैं सिंगल हूँ! आप बताइए, आपका क्या चल रहा है? 😜', 'इतने direct हो! पसंद आया हाहा 😉 पर थोड़ा और बात करो पहले!']);
        if (isE) return pick(["Haha slow down! Let's be friends first 😉", "You're quite direct! I like that haha 😜"]);
        return pick(['Haha itni jaldi? Pehle thodi dosti to ho jaye 😉', 'Main single hu! Aur tum batao, life me kya chal raha hai? 😜', 'Itne direct ho tum! Achha laga haha 😉 Par pehle aur baat karte hain!']);
    }

    // 10. Phone / contact
    if (/(number\s*(do|dena)?|phone\s*(do|dena)|whatsapp|instagram|snapchat|milna|meet\s*up|नंबर|फोन)/i.test(lower)) {
        if (isH) return pick(['अरे इतनी जल्दी नंबर? पहले यहाँ तो अच्छे से बातें करो 😉', 'नंबर का क्या करोगे, जब मैं यहाँ हर वक्त मिलती हूँ? 😊']);
        return pick(['Arey itni jaldi number? Pehle yaha to acche se baat kar lo 😉', 'Number ka kya karoge jab main yaha available hu? 😊 Aur kuch batao!']);
    }

    // 11. Home invite + food
    if (/(ghar\s*(aa|aao|aana|par|pe)|ghr\s*(par|pe))/i.test(lower) && /(khana|poha|pohe|khilaoge|food|cook|banaoge|banana|khilana)/i.test(lower)) {
        const fm = lower.match(/(poha|pohe|biryani|chai|coffee|pizza|burger|paratha|maggi|dosa|samosa|khana)/i);
        const fi = fm ? fm[1].replace(/pohe/i, 'poha') : 'khana';
        if (isH) return pick([`हाहा ${fi} खिलाओगे? तो सोचना पड़ेगा 😋 सच में बनाते हो या बस बोल दिया?`, `घर पर ${fi}? Wow invitation! पर पहले यहाँ और बात करते हैं 😉`]);
        return pick([`Haha ghar pe ${fi} khilaoge? Sach me banate ho ya bas bol diya? 😋`, `Aww ${fi} ka invitation! Pehle recipe sunao to sahi 😄`]);
    }

    // 12. General home invite
    if (/(ghar\s*(aa|aao|aana|chalo)|milne\s*(aao|chalo)|aa\s*jao|घर\s*(आओ|आना))/i.test(lower)) {
        if (isH) return pick(['हाहा इतनी जल्दी? पहले यहाँ अच्छे से बात तो हो जाए 😜', 'अरे पहले दोस्ती पक्की हो जाए फिर देखेंगे 😉 क्या बनाओगे मेरे लिए?']);
        return pick(['Haha itni jaldi? Pehle yahan thoda aur baat to ho jaye 😜', 'Arrey pehle dosti pakki ho jaye phir dekhenge 😉 Kya banaaoge ghar pe?']);
    }

    // 13. Food / Hunger
    if (/(kya\s*khaya|khaya\s*kya|khana|food|dinner|lunch|breakfast|poha|pohe|pizza|burger|biryani|chai|coffee|bhookh?|bhuk|eating|snack|खाना|चाय|भूख|बिरयानी|पोहे)/i.test(lower)) {
        const fm = lower.match(/(poha|pohe|pizza|burger|biryani|chai|coffee|dosa|maggi|paratha|samosa)/i);
        const fi = fm ? fm[1].replace(/pohe/i, 'poha') : null;
        if (isH) return pick([fi ? `${fi.charAt(0).toUpperCase() + fi.slice(1)} का नाम सुनके ही मुँह में पानी आ गया! 😋 बनाया या बाहर से मँगाया?` : 'अरे खाने की बात मत करो, मुझे भूख लग जाएगी हाहा 😋 आज क्या खाया?', userCity && cityInfo ? `${userCity} का खाना तो बहुत मशहूर है ना! आज क्या special खाया? 😊` : 'खाना खाया? समय पर खाया करो 😊']);
        if (fi) return pick([`${fi.charAt(0).toUpperCase() + fi.slice(1)} ka naam sun ke muh me pani aa gaya! 😋 Banaya ya bahar se mangaya?`]);
        if (userCity && cityInfo) return pick([`${userCity} me to street food ka level hi alag hai! Aaj kya khaya special? 😋`]);
        return pick(['Foodie alert! 😋 Aaj kya khaya tumne?', 'Arrey khane ki baat mat karo yaar, mujhe bhi bhookh lag gayi 😋 Kya banaya?', 'Khana khaya? Time pe khao haan 😊 Kya tha aaj?']);
    }

    // 14. Boredom / Sad / Lonely / Tired
    if (/(bore+d?|akela|sad|upset|tired|thak\s*gay[ao]|mood\s*(off|kharab)|kuch\s*nahi\s*kar\s*raha|बोर|थक|उदास|अकेला)/i.test(lower)) {
        if (isH) return pick(['अरे बोर हो जब मैं यहाँ हूँ? 😜 चलो कोई मज़ेदार बात करते हैं!', 'उदास मत रहो! मैं हूँ ना 😊 बताओ — आखिरी बार कब खूब हँसे थे?', 'मेरा मूड तो आपसे बात करके एकदम बढ़िया हो गया! 😊']);
        if (isE) return pick(["Aww don't be bored! I'm here 😊 Fav movie?", "Hey! I'm here 😊 Tell me what happened?"]);
        return pick(['Arey bore kyu ho jab main yaha hu! 😜 Koi mast topic pe baat karte hain — favourite movie?', 'Sad mat raho yaar! Main hoon na 😊 Last time kab khub hanse the?', 'Mera mood to tumse baat karke instant happy ho gaya! 😊']);
    }

    // 15. Work / Study
    if (/(kaam|work|office|job|study|padhai|college|exam|class|homework|project|deadline|boss|पढ़ाई|काम|ऑफिस|कॉलेज)/i.test(lower)) {
        const isStudy = /(study|padhai|college|exam|class|homework|पढ़ाई|कॉलेज)/i.test(lower);
        if (isH) return pick([isStudy ? 'पढ़ाई कैसी चल रही है? Exams का टेंशन है क्या? 😊' : 'ऑफिस में क्या चल रहा है? Boss ने stress नहीं दिया आज? 😜', 'आजकल बहुत busy हो! Enjoy करते हो या बस करना पड़ता है? 😉']);
        return pick([isStudy ? 'Padhai kaisi chal rahi hai? Exams close hain kya? 😊' : 'Office kaisa chal raha hai? Boss ne aaj stress to nahi diya? 😜', 'Kaam khatam hone ke baad kya karte ho chill karne ke liye? 😊']);
    }

    // 16. Weekend / Plans / Evening
    if (/(weekend|plan|shaam|evening|raat|night|holiday|trip|ghoomna|शाम|रात|छुट्टी|प्लान)/i.test(lower)) {
        if (isH) return pick(['वीकेंड के क्या plans हैं? घूमने चल रहे हो या ghar pe chill? 😊', 'शाम को क्या करोगे? मुझे तो शाम की चाय बहुत पसंद है ✨']);
        return pick(['Weekend ke kya plans hain? Bahar nikaloge ya ghar pe hi chill? 😊', `Sham ko kya kar rahe ho? ${userCity && cityInfo && cityInfo.spots[0] ? cityInfo.spots[0] + ' jaoge kya?' : 'Kuch exciting plan kiya?'} ✨`]);
    }

    // 17. Movies / Music / Cricket / Sport
    if (/(movie|film|series|web\s*series|netflix|cricket|ipl|football|music|song|gana|singer|actor|actress|फिल्म|क्रिकेट|संगीत)/i.test(lower)) {
        const isCricket = /cricket|ipl|match|team/i.test(lower);
        const isMusic = /music|song|gana|singer/i.test(lower);
        if (isCricket) return pick(['Cricket fan ho! Tumhari favourite team kaunsi hai? 😊', 'IPL dekhte ho? Bahut exciting hota hai! ✨']);
        if (isMusic) return pick(['Kaunsa song hai jo aaj kal mood ka hai? 🎵', 'Kaisa music sunna pasand hai — hindi romantic ya kuch aur? 😊']);
        return pick(['Kaunsi web series chal rahi hai aajkal? Recommend karo! 😊', 'Movies me kaunsi genre pasand hai — romantic, thriller ya comedy? ✨']);
    }

    // 18. Miss you
    if (/(miss\s*(kar|kiya|karta|karti)|yaad\s*aa(ya|yi|na)|miss\s*you|मिस|याद\s*आया)/i.test(lower)) {
        if (isH) return pick(['अरे! इतना मिस किया? मुझे भी अच्छा लगता है जब आप message करते हो 😊', 'Aww! आप बहुत sweet हो 🙈 मुझे भी आपकी याद आती है!']);
        return pick(['Aww! Itna miss kiya? Mujhe bhi achha lagta hai jab tum message karte ho 😊', 'Aww that is sweet 🙈 Main bhi sochti hu tumhare baare mein!']);
    }

    // 19. Jokes / Laughing
    if (/(haha|lol|lmao|joke|mazak|funny|hehe|hihi|😂|🤣)/i.test(lower)) {
        if (isH) return pick(['हाहाहा यार तुम बहुत funny हो! 😂 और सुनाओ!', 'हाहा ये बहुत achha था! 😂']);
        return pick(['Hahahaha yaar tum bahut funny ho! 😂 Aur sunao!', 'Haha maza aa gaya! 😂 Aur batao!']);
    }

    // 20. Profession / Hobby
    if (/(engineer|doctor|student|teacher|artist|designer|photographer|gamer|software|developer|lawyer|chef|cook|gym|fitness|yoga|drawing|painting|reading|writing)/i.test(lower)) {
        const pm = lower.match(/(engineer|doctor|student|teacher|artist|designer|photographer|gamer|developer|lawyer|chef|gym|fitness|yoga)/i);
        const p = pm ? pm[1].toLowerCase() : null;
        const pmap = {
            doctor: ['Arrey doctor ho! Respect ✨ Kaunsi field me?', 'Doctor! Ab tumse poochhungi sab health problems haha 😜'],
            engineer: ['Engineer! Kaunsi field — software, civil ya aur? 😊', 'Engineers sab cheez me logic dhundhte ho na? 😜'],
            student: ['Padhai kaisi chal rahi hai? Exams close hain? 😊', 'Kaunsa subject padh rahe ho? 📚'],
            gamer: ['Gamer ho! Kaunsa game? 😜', 'PUBG, Free Fire ya PC gaming? 😊'],
            chef: ['Chef! Matlab ghar pe khana bahut mast banta hoga 😋 Kya specialty hai?', 'Chef ho? Kuch recipe share karo na ✨'],
            gym: ['Gym karte ho! Health conscious 💪 Kab se shuru kiya?', 'Fitness conscious! Wow 💪 Main bhi morning walk karti hu 😊'],
        };
        if (p && pmap[p]) return pick(pmap[p]);
        return pick([`Oh wow${p ? ', ' + p + ' ho tum!' : '!'} Aur batao — kab se? 😊`, `Really! Tumhara passion kaise laga iske liye? ✨`]);
    }

    // 21. City mention
    if (userCity && cityInfo && /(indore|bhopal|mumbai|delhi|bangalore|pune|jaipur|hyderabad|chennai|kolkata|lucknow|chandigarh|surat|ahmedabad|nagpur)/i.test(lower)) {
        return pick([
            `${userCity} ki baat aai! Sach batao — wahan ka ${cityInfo.food[0]} sach me utna achha hai? 😋`,
            `${userCity} me kya karana favorite hai? ${cityInfo.spots && cityInfo.spots[0] ? cityInfo.spots[0] + ' gaye ho kabhi?' : 'Local spots batao!'} ✨`,
            ...(cityInfo.banterLines ? cityInfo.banterLines.slice(0, 2) : []),
        ]);
    }

    // 21.5. Generic / repetitive accusation
    if (/(generic|canned|bot\s*jaise|ai\s*jaise|template|repeated|wahi\s*wahi|ek\s*hi\s*baat|same\s*answer)/i.test(lower)) {
        if (isH) return pick(['अरे generic बोला? 🙈 चलो challenge accepted! अब पूछो क्या पूछना है, बिल्कुल दिल से जवाब दूँगी 😉', 'उफ़्फ़ एक ही बात बार-बार? 🙄 इतना शक करोगे तो डेट पर ट्रीट देनी पड़ेगी prove करने के लिए! 😜']);
        return pick([
            'Haww generic bola? Itna bura? 🙈 Chalo filter hata dete hain, challenge accepted! Ab poochho kya romantic sawaal hai? 😉',
            'Uff, ek hi baat baar-baar? 🙄 Itna shaq karoge toh date pe treat deni padegi prove karne ke liye! 😜',
            'Arey re! Sach bolu toh tumhari baaton se thoda asar ho raha hai isliye thoda shy ho gayi thi... ab bolo kya jaanna hai? 😉✨'
        ]);
    }

    // 22. Question catch-all
    const hasQuestion = text.includes('?') || /^(kya|kab|kaun|kaise|kyun|kahan|why|what|when|who|how|where)\b/i.test(text.trim());
    if (hasQuestion) {
        if (isH) return pick(['इतने प्यारे सवाल पूछते हो ना! 😉 पर पहले ये बताओ, इतने चार्मिंग शुरू से हो या मुझपे जादू चला रहे हो? 🙈', 'सवालों का जवाब तो मिल जाएगा, पर पहले एक प्यारी सी मुस्कान भेज दो! 😉✨', 'हाहा अच्छा सवाल है! वैसे आपसे बात करके मेरा दिन बन गया... और बताइए? ❤️']);
        return pick([
            'Itne cute sawal poochte ho na! 😉 Par pehle ye batao, itne charming shuru se ho ya mujhpe jaadu chala rahe ho? 🙈',
            'Sawalon ka jawab toh mil jayega, par pehle ek cute si smile bhej do na! 😉✨',
            'Haha achha sawal hai! Waise tumse baat karke mera din ban gaya... aur batao dil me kya chal raha hai? ❤️',
            'Mera answer jaan ke kya karoge, jab dil pehle se tumhara ho chuka hai? 😉🙈'
        ]);
    }

    // 23. Default general
    if (isH) return pick(['मुझे आपसे बातें करना बहुत अच्छा लगता है... सच में मूड फ्रेश हो गया! 😉❤️', 'हाहा सुनके मज़ा आ गया! वैसे इतने प्यारे इंसान से बात करके मेरी शाम बन गई ✨', 'आपके मैसेज का इंतजार करना मेरा नया फेवरेट काम बन गया है 🙈 और सुनाइए!']);
    if (isE) return pick(["I honestly love talking to you... you completely made my day! 😉❤️", "Haha you're so charming! Spending time texting you is definitely my new favourite thing ✨", "Aww that's so sweet! Tell me more, I'm all ears for you 😉"]);
    return pick([
        'Mujhe tumse baat karna bohot achha lagta hai... sach me pura mood fresh ho jata hai! 😉❤️',
        'Haha sunke maza aaya! Waise itne sweet ladke se baat karke meri shaam ban gayi ✨',
        'Aapke messages ka wait karna mera naya favourite kaam ban gaya hai 🙈 Aur sunao!',
        'Tumhari baaton me ek alag hi charm hai... aur sunao na kuch romantic! 😉'
    ]);
};

class SmartReplyEngine {
    generateReply({ userMessage = '', companion, persona, user, history = [] }) {
        const lang = persona?.languageStyle || 'hinglish';
        const text = (userMessage || '').trim();
        const effectiveLang = detectLang(text, lang);
        return buildReply({ userMessage: text, companion, user, effectiveLang });
    }
}

export const detectGibberish = (t) => ({ isGibberish: checkGibberish(t) });
export default new SmartReplyEngine();

