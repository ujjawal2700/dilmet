/**
 * Distance Calculator - Haversine Formula for Approximate Distance
 * @purpose: Calculate approximate distance between two coordinates in kilometers
 * @usage: Used for displaying "X km away" instead of exact location for privacy
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate {lat, lng}
 * @param coord2 - Second coordinate {lat, lng}
 * @returns Approximate distance in kilometers (rounded)
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
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

    return Math.round(distance); // Returns approximate km
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Format distance for display with privacy buckets
 * @param distance - Distance in kilometers
 * @returns Formatted string like "< 1 km away", "5 km away", "10+ km away"
 */
export function formatDistance(distance: number): string {
    if (distance < 1) {
        return '< 1 km away';
    } else if (distance <= 2) {
        return '2 km away';
    } else if (distance <= 5) {
        return '5 km away';
    } else if (distance <= 10) {
        return '10 km away';
    } else if (distance <= 20) {
        return '20 km away';
    } else if (distance <= 50) {
        return `${Math.round(distance / 10) * 10} km away`; // Round to nearest 10
    } else {
        return '50+ km away';
    }
}

/**
 * Check if coordinates are valid
 */
export function areCoordinatesValid(coord: Coordinates | null | undefined): boolean {
    if (!coord) return false;
    return (
        typeof coord.lat === 'number' &&
        typeof coord.lng === 'number' &&
        coord.lat >= -90 &&
        coord.lat <= 90 &&
        coord.lng >= -180 &&
        coord.lng <= 180 &&
        !(coord.lat === 0 && coord.lng === 0) // Exclude default [0,0]
    );
}
