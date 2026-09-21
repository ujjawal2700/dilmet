/**
 * City Resolver & Local Culture Knowledge Base
 * @purpose: Accurately resolve city from user profile / address strings
 * and provide rich local touchpoints (street food, hangout spots, vibes).
 */

// Comprehensive knowledge base of Indian cities with rich cultural touchpoints
export const CITY_CULTURE = {
    indore: {
        name: 'Indore',
        aliases: ['indore', 'indori', 'indor'],
        state: 'Madhya Pradesh',
        food: ['Poha Jalebi', 'Sarafa Bazar night market', 'Chappan Dukan (56 Dukan)', 'Bhutta kis', 'Garadu'],
        spots: ['56 Dukan', 'Sarafa Bazar', 'Rajwada Palace', 'Chokhi Dhani', 'Ralamandal'],
        vibe: 'Cleanest city of India, lively foodies, night market culture, warm and welcoming people',
        slang: ['bhiyo', 'arre bhiya', 'sahi hai', 'poha party'],
        openerLines: [
            "Hey! Saw your profile, tum Indore se ho kya? Poha-jalebi to roz ka hoga fir? 😋",
            "Indori ho? Wah! 56 Dukan ya Sarafa, raat me kahan jana zyada pasand hai? ✨",
            "Hey there! India ki cleanest city Indore se ho aap, suna hai waha ke log bohot dil ke saaf aur foodie hote hain 😉"
        ],
        banterLines: [
            "Arey Indore se ho! Kabhi Sarafa Bazar gaye ho raat ke 12 baje? Waha ki rabdi aur jalebi yaad aa gayi 😋",
            "Wah! Indore walo ka alag hi swag hota hai, cleanest city for a reason! Chappan Dukan pe kya best lagta hai?",
            "Indore ka mausam kaisa hai abhi? Waha ke food streets ka to pura India fan hai ✨",
            "Indori ho to pakka foodie hoge! Sach sach batao, best poha kahan milta hai Indore me? 😉"
        ]
    },
    bhopal: {
        name: 'Bhopal',
        aliases: ['bhopal', 'bhopali'],
        state: 'Madhya Pradesh',
        food: ['Poha Jalebi', 'Bhopali Biryani', 'Sulemani Chai', 'Shahi Tukda'],
        spots: ['Upper Lake (Bada Talab)', 'VIP Road', 'DB Mall', 'Van Vihar'],
        vibe: 'City of Lakes, calm, green and scenic evenings by the lake',
        slang: ['mian', 'bhopali'],
        openerLines: [
            "Hey! Bhopal se ho kya? Upper Lake ki evenings to kaafi peaceful hoti hain na? ✨",
            "Hi there! City of Lakes Bhopal se ho? Suna hai waha bohot pyara aur sukoon bhara vibe hota hai 😊"
        ],
        banterLines: [
            "Bhopal ki VIP Road aur Upper Lake pe evening walk ka alag hi maza hai na? 🌊",
            "Bhopal me ho to mausam kaafi mast rehta hoga lakes ki wajah se! DB Mall ya lake view kahan jaana pasand hai?"
        ]
    },
    mumbai: {
        name: 'Mumbai',
        aliases: ['mumbai', 'bombay'],
        state: 'Maharashtra',
        food: ['Vada Pav', 'Pav Bhaji', 'Sev Puri', 'Misal Pav'],
        spots: ['Marine Drive', 'Bandra Bandstand', 'Juhu Beach', 'Colaba'],
        vibe: 'City that never sleeps, sea breeze, monsoon walks, fast-paced life',
        slang: ['yaar', 'boss', 'bindass', 'bambaiya'],
        openerLines: [
            "Hey! Mumbai se ho? Marine Drive ki hawayein aur cutting chai yaad aa gayi ✨",
            "Hi! Mumbai ki fast life me mere se chat karne ka time nikal liya, impressive! 😉"
        ],
        banterLines: [
            "Mumbai ki baarish aur Marine Drive pe baithna... absolute vibe! Tumhara favourite spot kaunsa hai?",
            "Mumbai ka traffic jhel ke bhi itna active reh lete ho? Kaha se laate ho itni energy haha 😂"
        ]
    },
    delhi: {
        name: 'Delhi',
        aliases: ['delhi', 'new delhi', 'dilli'],
        state: 'Delhi',
        food: ['Chole Bhature', 'Momos', 'Butter Chicken', 'Paranthe Wali Gali'],
        spots: ['Connaught Place (CP)', 'Hauz Khas Village', 'India Gate', 'Majnu Ka Tilla'],
        vibe: 'Dilwalon ki Dilli, mouthwatering street food, energetic culture',
        slang: ['arre bhai', 'jugaad', 'scene kya hai', 'sahi me'],
        openerLines: [
            "Hey! Dilwalon ki Delhi se ho aap? Waha ka street food to mindblowing hota hai ✨",
            "Hello! Delhi me kaisa chal raha hai? CP ya HKV me coffee peene gaye the recent me? 😊"
        ],
        banterLines: [
            "Dilli ke chole bhature aur momos ke aage sab fail hai na? Sach sach batana tumhara favourite street food spot kaunsa hai!",
            "Delhi ka mausam to extreme rehta hai hamesha! Abhi waha kya scene hai garmi ya thand? 😉"
        ]
    },
    jaipur: {
        name: 'Jaipur',
        aliases: ['jaipur', 'pink city'],
        state: 'Rajasthan',
        food: ['Pyaaz Kachori', 'Dal Baati Churma', 'Ghewar', 'Lassi'],
        spots: ['Hawa Mahal', 'Amer Fort', 'Nahargarh', 'Patrika Gate'],
        vibe: 'Royal heritage, pink streets, colourful bazaars and sunset views',
        slang: ['hukum', 'sa'],
        openerLines: [
            "Hey! Pink City Jaipur se ho? Nahargarh sunset view to kaafi romantic hota hai na? 🌸",
            "Hi! Jaipur ke royal aesthetic aur pyaaz kachori ka to koi muqabla nahi hai ✨"
        ],
        banterLines: [
            "Jaipur me Hawa Mahal ya Nahargarh ka sunset dekha hai kabhi? The view is just breathtaking!",
            "Rawat ki pyaaz kachori aur lassi... Jaipur ka khana yaad aate hi foodie ban jaati hu 😋"
        ]
    },
    pune: {
        name: 'Pune',
        aliases: ['pune', 'punekar'],
        state: 'Maharashtra',
        food: ['Misal Pav', 'Bakharwadi', 'Bun Maska Chai', 'Sujata Mastani'],
        spots: ['FC Road', 'Koregaon Park (KP)', 'Viman Nagar', 'Sinhagad Fort'],
        vibe: 'Student capital, cafe hopping, cool weather, vibrant youth culture',
        slang: ['bhau', 'kasa kay'],
        openerLines: [
            "Hey! Pune se ho? KP ke cafes aur FC road ki shopping vibe to best hai na ✨",
            "Hi! Punekar ho aap? Suna hai Pune ka weather aur cafe culture bohot amazing hai 😊"
        ],
        banterLines: [
            "Pune ka pleasant weather aur FC road ki chai-misal, absolute perfection! KP me favourite cafe kaunsa hai?",
            "Pune ki vibes kaafi chill hoti hain. Weekend pe Sinhagad trek ya cafe hopping? 😉"
        ]
    },
    bangalore: {
        name: 'Bangalore',
        aliases: ['bangalore', 'bengaluru'],
        state: 'Karnataka',
        food: ['Benne Dosa', 'Filter Coffee', 'Idli Vada', 'Craft Beer'],
        spots: ['Church Street', 'Indiranagar', 'Koramangala', 'Cubbon Park'],
        vibe: 'Garden city, startups, breezy weather, cafe & pub culture',
        slang: ['macha', 'guru'],
        openerLines: [
            "Hey! Bengaluru se ho? Cubbon Park ki morning walk ya Indiranagar ke cafes? ✨",
            "Hi! Tech capital Bangalore se ho aap, weather to mast suhana hoga waha abhi? 😊"
        ],
        banterLines: [
            "Bangalore ka weather hamesha sorted rehta hai bas Silk Board traffic ko chhod ke haha! Filter coffee pasand hai ya cold brew?",
            "Church Street pe weekend stroll ya Koramangala cafe hopping, kya prefer karte ho? ✨"
        ]
    },
    hyderabad: {
        name: 'Hyderabad',
        aliases: ['hyderabad', 'hyderabadi'],
        state: 'Telangana',
        food: ['Hyderabadi Dum Biryani', 'Irani Chai with Osmania Biscuits', 'Haleem'],
        spots: ['Charminar', 'Durgam Cheruvu', 'Jubilee Hills', 'Hussain Sagar'],
        vibe: 'City of pearls, aromatic biryani, nawabi tehzeeb, tech hubs',
        slang: ['baigan', 'ustaad', 'potti', 'kaiku'],
        openerLines: [
            "Hey! Hyderabad se ho? Irani chai aur Osmania biscuit to daily routine hoga? ☕✨",
            "Hi! City of Biryani se ho aap, waha ki Dum Biryani ke aage sab fika lagta hai na? 😋"
        ],
        banterLines: [
            "Hyderabad ki Biryani ka koi competition hi nahi hai! Paradise ya Bawarchi, tumhara favourite kaunsa hai?",
            "Charminar ke paas Irani chai piye bina shaam adhuri lagti hai na? Jubilee Hills ka cafe culture bhi kaafi happening hai ✨"
        ]
    },
    ahmedabad: {
        name: 'Ahmedabad',
        aliases: ['ahmedabad', 'amdavad'],
        state: 'Gujarat',
        food: ['Khaman Dhokla', 'Fafda Jalebi', 'Manek Chowk Street Food', 'Maskabun'],
        spots: ['Sabarmati Riverfront', 'Manek Chowk', 'Sindhu Bhavan Road', 'Law Garden'],
        vibe: 'Business minded, foodies, midnight street food, peaceful Riverfront',
        slang: ['bhai', 'majama'],
        openerLines: [
            "Hey! Amdavad se ho? Riverfront ki evening breeze to bohot peaceful hoti hai na ✨",
            "Hi! Ahmedabad ke Manek Chowk ka night food to legendary hai! Street food pasand hai aapko? 😋"
        ],
        banterLines: [
            "Manek Chowk pe raat ke 1 baje chocolate sandwich ya gwalior dosa khaye bina Amdavad adhura hai!",
            "Sabarmati Riverfront pe shaam ko walk karna is pure peace. Sindhu Bhavan Road pe hangout karte ho?"
        ]
    },
    kolkata: {
        name: 'Kolkata',
        aliases: ['kolkata', 'calcutta'],
        state: 'West Bengal',
        food: ['Kolkata Biryani', 'Roshogolla', 'Puchka', 'Kathi Roll'],
        spots: ['Park Street', 'Victoria Memorial', 'Princep Ghat', 'Howrah Bridge'],
        vibe: 'City of joy, colonial charm, art, literature, and heavenly desserts',
        slang: ['dada', 'bhalo'],
        openerLines: [
            "Hey! City of Joy Kolkata se ho? Princep Ghat sunset and kulhad chai are love ✨",
            "Hi! Kolkata ke Puchka aur sweets ka to pura India fan hai! Sweets pasand hain aapko? 😊"
        ],
        banterLines: [
            "Kolkata ki aloo wali biryani aur Park Street ki vibes, alag hi sukoon hai waha!",
            "Victoria Memorial ke lawn me shaam bitana ya Princep Ghat pe boat ride, kya favourite hai tumhara?"
        ]
    },
    lucknow: {
        name: 'Lucknow',
        aliases: ['lucknow', 'lakhnavi'],
        state: 'Uttar Pradesh',
        food: ['Galouti Kebab', 'Lucknawi Biryani', 'Basket Chaat', 'Makhan Malai'],
        spots: ['Hazratganj', 'Marine Drive Gomti Nagar', 'Rumi Darwaza', 'Bada Imambara'],
        vibe: 'City of Nawabs, tehzeeb, poetry, majestic architecture',
        slang: ['janab', 'pehle aap'],
        openerLines: [
            "Hey! City of Nawabs Lucknow se ho? 'Muskuraiye aap Lucknow me hain'! 😊✨",
            "Hi! Lucknow ki tehzeeb aur Hazratganj ki ganjing to famous hai na? 🌸"
        ],
        banterLines: [
            "Hazratganj me 'ganjing' karna aur Tunday ke kebabs... Lucknow ka style hi alag hai! Tumhara favourite spot kaunsa hai?",
            "Gomti Riverfront pe shaam ko hawa khana is so refreshing na? Lucknow ki tehzeeb waise bohot sweet hoti hai ✨"
        ]
    }
};

/**
 * Clean and resolve city name from raw string or user profile object.
 * Filters out numeric values, building numbers (e.g. '109-B', 'Flat 12', 'Plot 4'),
 * pincodes (e.g. '452001'), and parses fullAddress.
 */
export const resolveUserCity = (userOrProfile) => {
    if (!userOrProfile) return null;

    const profile = userOrProfile.profile || userOrProfile;
    const location = profile.location || {};

    const rawCity = (location.city || profile.city || '').trim();
    const rawFullAddress = (location.fullAddress || profile.fullAddress || profile.address || '').trim();
    const rawState = (location.state || profile.state || '').trim();

    // Check if rawCity is an invalid building number / street token
    const isBadCityToken = (token) => {
        if (!token) return true;
        const s = token.trim();
        if (s.length < 2) return true;
        // Contains digits combined with hyphen or slash like '109-B', '20/4', 'B-12'
        if (/\d+[-/][a-zA-Z0-9]+/i.test(s) || /^[a-zA-Z0-9]+[-/]\d+/i.test(s)) return true;
        // Is pure number or postal code like '452001'
        if (/^\d{3,}$/.test(s)) return true;
        // Contains words like flat, plot, shop, floor, building, road, lane, street
        if (/\b(flat|plot|shop|floor|bldg|building|road|rd|lane|st|street|sector|sec|gali|mohalla|gwaltoli|nagar)\b/i.test(s)) {
            // But don't disqualify valid cities like "Gautam Buddha Nagar" unless it's just a street
            if (!/^(indore|bhopal|mumbai|delhi|jaipur|pune|bangalore|hyderabad|lucknow|kolkata|ahmedabad)/i.test(s)) {
                return true;
            }
        }
        return false;
    };

    // First, search the fullAddress and rawCity against our known Indian cities dictionary
    const textToSearch = `${rawFullAddress} ${rawCity} ${rawState}`.toLowerCase();
    for (const [key, info] of Object.entries(CITY_CULTURE)) {
        for (const alias of info.aliases) {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(textToSearch)) {
                return info.name;
            }
        }
    }

    // If not matched directly in dictionary, but rawCity looks like a clean city name:
    if (rawCity && !isBadCityToken(rawCity)) {
        // Capitalize first letters nicely
        return rawCity
            .split(/\s+/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }

    // If rawCity was bad (e.g. '109-B'), try parsing comma-separated segments from fullAddress
    if (rawFullAddress) {
        const segments = rawFullAddress.split(',').map(s => s.trim()).filter(Boolean);
        // Addresses usually format like: [0: building, 1: locality, 2: City, 3: State Pincode, 4: India]
        for (let i = segments.length - 1; i >= 0; i--) {
            const seg = segments[i];
            // Skip "India" or country
            if (/^india$/i.test(seg)) continue;
            // Clean out any 6-digit Indian pincode
            const cleanedSeg = seg.replace(/\b\d{6}\b/g, '').trim();
            if (!cleanedSeg) continue;

            // If it's not a bad token and not a state name
            if (!isBadCityToken(cleanedSeg)) {
                return cleanedSeg
                    .split(/\s+/)
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');
            }
        }
    }

    return null;
};

/**
 * Retrieve culture metadata and banter lines for a given city name.
 */
export const getCityCulture = (cityName) => {
    if (!cityName) return null;
    const lower = cityName.toLowerCase().trim();

    for (const [key, info] of Object.entries(CITY_CULTURE)) {
        for (const alias of info.aliases) {
            if (lower.includes(alias)) {
                return info;
            }
        }
    }

    // Generic Indian city structure if city isn't in our curated top list
    return {
        name: cityName,
        aliases: [lower],
        state: '',
        food: ['local street food', 'famous chai', 'sweet shops'],
        spots: ['local hangout spots', 'city center'],
        vibe: 'lively city with warm people',
        slang: [],
        openerLines: [
            `Hey! Saw that you're from ${cityName}! What's your favourite thing about the city? ✨`,
            `Hi! Hope everything is wonderful in ${cityName} today! How's your day going? 😊`
        ],
        banterLines: [
            `Waise ${cityName} ka mausam kaisa hai abhi? Waha ka favourite street food kya hai tumhara? 😋`,
            `${cityName} me weekend pe kahan jana pasand karte ho? Kuch achhe spots batao na! ✨`,
            `${cityName} walo ki alag hi vibe hoti hai! Kafi chill lagte ho tum 😉`
        ]
    };
};

export default {
    CITY_CULTURE,
    resolveUserCity,
    getCityCulture
};
