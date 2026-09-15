/**
 * IST Day Boundary Utility
 * @purpose: Compute "today" consistently in India Standard Time (UTC+5:30),
 *           regardless of the server's own local timezone. Used for
 *           daily-reset features (e.g. Tasks) where "resets at 12 AM" must
 *           mean 12 AM IST for an India-based user base, not wherever the
 *           host machine happens to be configured.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns a 'YYYY-MM-DD' key for the IST calendar day containing `date`.
 */
export const getISTDateKey = (date = new Date()) => {
    const istTime = new Date(date.getTime() + IST_OFFSET_MS);
    return istTime.toISOString().slice(0, 10);
};

/**
 * Returns a Date representing the instant of the START of `date`'s IST
 * calendar day (i.e. the previous 12:00 AM IST), expressed as a normal UTC
 * Date object. Two dates that fall on the same IST calendar day always
 * produce the same value here - safe to store/compare directly.
 */
export const getISTDayStart = (date = new Date()) => {
    const key = getISTDateKey(date); // 'YYYY-MM-DD' in IST
    // Midnight IST for that key, converted back to a UTC instant
    return new Date(`${key}T00:00:00.000+05:30`);
};

/**
 * Milliseconds remaining until the next IST midnight (i.e. until the
 * current day's tasks/rewards reset).
 */
export const msUntilNextISTMidnight = (date = new Date()) => {
    const todayStart = getISTDayStart(date);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    return tomorrowStart.getTime() - date.getTime();
};
