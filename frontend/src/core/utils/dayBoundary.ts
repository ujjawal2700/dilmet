/**
 * IST Day Boundary Utility (mirrors backend/src/utils/dayBoundary.js)
 * @purpose: Compute the countdown to the next daily Tasks reset, which
 *           always happens at 12:00 AM IST regardless of the viewer's own
 *           device timezone - matches the backend's reset boundary exactly.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const getISTDateKey = (date: Date = new Date()): string => {
    const istTime = new Date(date.getTime() + IST_OFFSET_MS);
    return istTime.toISOString().slice(0, 10);
};

export const getISTDayStart = (date: Date = new Date()): Date => {
    const key = getISTDateKey(date);
    return new Date(`${key}T00:00:00.000+05:30`);
};

export const msUntilNextISTMidnight = (date: Date = new Date()): number => {
    const todayStart = getISTDayStart(date);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    return tomorrowStart.getTime() - date.getTime();
};

export const formatCountdown = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
