/**
 * Distance Calculator Utility (Backend)
 * @purpose: Calculate approximate distance between two coordinates using Haversine formula
 * @usage: Used in user profile endpoints to calculate distance to other users
 */

/**
 * Calculate distance between two coordinates
 * @param {Object} coord1 - First coordinate { lat, lng }
 * @param {Object} coord2 - Second coordinate { lat, lng }
 * @returns {number} Distance in kilometers (rounded)
 */
export const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Format distance with privacy buckets
 * @param {number} distance - Distance in km
 * @returns {string} Formatted distance
 */
export const formatDistance = (distance) => {
    if (distance < 1) return '< 1 km';
    if (distance <= 2) return '2 km';
    if (distance <= 5) return '5 km';
    if (distance <= 10) return '10 km';
    if (distance <= 20) return '20 km';
    if (distance <= 50) return `${Math.round(distance / 10) * 10} km`;
    return '50+ km';
};

/**
 * Check if coordinates are valid
 */
export const areCoordinatesValid = (lat, lng) => {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        !(lat === 0 && lng === 0) // Exclude default [0,0]
    );
};

export default {
    calculateDistance,
    formatDistance,
    areCoordinatesValid,
};
