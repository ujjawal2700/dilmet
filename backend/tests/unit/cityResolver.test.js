import { resolveUserCity, getCityCulture, CITY_CULTURE } from '../../src/utils/cityResolver.js';

describe('CityResolver & Culture Utilities', () => {
    test('resolves Indore from user profile address', () => {
        const userWithAddress = {
            profile: {
                address: 'Near 56 Dukan, Indore, Madhya Pradesh'
            }
        };
        const city = resolveUserCity(userWithAddress);
        expect(city).toBe('Indore');
    });

    test('resolves Mumbai from user city property', () => {
        const userWithCity = {
            profile: {
                city: 'Mumbai'
            }
        };
        const city = resolveUserCity(userWithCity);
        expect(city).toBe('Mumbai');
    });

    test('returns null for empty or invalid location tokens', () => {
        expect(resolveUserCity(null)).toBeNull();
        expect(resolveUserCity({})).toBeNull();
        expect(resolveUserCity({ profile: { city: '109-B' } })).toBeNull();
        expect(resolveUserCity({ profile: { location: { city: 'Flat 12' } } })).toBeNull();
    });

    test('getCityCulture returns rich cultural touchpoints for Indore', () => {
        const culture = getCityCulture('Indore');
        expect(culture).toBeDefined();
        expect(culture.food).toContain('Poha Jalebi');
        expect(culture.spots).toContain('56 Dukan');
        expect(culture.banterLines.length).toBeGreaterThan(0);
    });

    test('CITY_CULTURE contains major Indian cities', () => {
        expect(CITY_CULTURE.indore).toBeDefined();
        expect(CITY_CULTURE.delhi).toBeDefined();
        expect(CITY_CULTURE.mumbai).toBeDefined();
        expect(CITY_CULTURE.bangalore).toBeDefined();
    });
});
