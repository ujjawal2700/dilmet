import { getISTDateKey, getISTDayStart, msUntilNextISTMidnight } from '../../src/utils/dayBoundary.js';

describe('IST Day Boundary Utilities', () => {
    test('computes IST Date Key correctly regardless of UTC time', () => {
        // 2026-09-21 18:30 UTC = 2026-09-22 00:00 IST
        const dateUtcEvening = new Date('2026-09-21T18:30:00.000Z');
        expect(getISTDateKey(dateUtcEvening)).toBe('2026-09-22');

        // 2026-09-21 18:29 UTC = 2026-09-21 23:59 IST
        const dateUtcBeforeMidnight = new Date('2026-09-21T18:29:00.000Z');
        expect(getISTDateKey(dateUtcBeforeMidnight)).toBe('2026-09-21');
    });

    test('getISTDayStart returns consistent Date on the same calendar day', () => {
        const morning = new Date('2026-09-21T06:00:00.000Z');
        const afternoon = new Date('2026-09-21T12:00:00.000Z');

        const start1 = getISTDayStart(morning);
        const start2 = getISTDayStart(afternoon);

        expect(start1.getTime()).toBe(start2.getTime());
    });

    test('msUntilNextISTMidnight counts down correctly', () => {
        // Exactly 1 hour before midnight IST (23:00 IST = 17:30 UTC)
        const dateOneHourBefore = new Date('2026-09-21T17:30:00.000Z');
        const msRemaining = msUntilNextISTMidnight(dateOneHourBefore);

        // Should be approximately 3,600,000 ms (1 hour)
        expect(msRemaining).toBe(60 * 60 * 1000);
    });
});

