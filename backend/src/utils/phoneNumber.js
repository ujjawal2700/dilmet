/**
 * Phone Number Utility - Backend
 * @purpose: Normalize phone numbers to consistent format
 * 
 * Accepts:
 * - 10 digits: 9876543210
 * - With 91 prefix: 919876543210
 * - With +91 prefix: +919876543210
 * 
 * Always returns: 919876543210 (12 digits with 91 prefix)
 */

/**
 * Normalize phone number to standard format (91 + 10 digits)
 * @param {string} phoneNumber - Raw phone number input
 * @returns {string} Normalized phone number with 91 prefix (12 digits total)
 * @throws {Error} if phone number is invalid
 */
export const normalizePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
        throw new Error('Phone number is required');
    }

    // Remove all non-digit characters (including +, spaces, dashes)
    let digits = phoneNumber.replace(/\D/g, '');

    // Handle different formats
    if (digits.startsWith('91')) {
        // Already has 91 prefix
        if (digits.length === 12) {
            // Perfect: 919876543210
            return digits;
        } else if (digits.length === 10) {
            // Just country code without number: 91 (invalid)
            throw new Error('Invalid phone number');
        } else if (digits.length > 12) {
            // Too many digits, keep last 12
            return digits.slice(-12);
        } else {
            // Less than 12 digits with 91 prefix (invalid)
            throw new Error('Invalid phone number - incomplete');
        }
    } else if (digits.length === 10) {
        // Just the 10-digit number: 9876543210
        return '91' + digits;
    } else if (digits.length === 12 && !digits.startsWith('91')) {
        // 12 digits but doesn't start with 91 (invalid for India)
        throw new Error('Invalid phone number format');
    } else {
        // Any other length is invalid
        throw new Error('Invalid phone number - wrong length');
    }
};

/**
 * Validate if a phone number string is valid for India
 * @param {string} phoneNumber - Raw phone number input
 * @returns {boolean} true if valid, false otherwise
 */
export const isValidIndianPhoneNumber = (phoneNumber) => {
    try {
        const normalized = normalizePhoneNumber(phoneNumber);
        // Should be exactly 12 digits starting with 91
        return /^91\d{10}$/.test(normalized);
    } catch {
        return false;
    }
};

/**
 * Format phone number for display (with +91 prefix)
 * @param {string} phoneNumber - Normalized phone number (12 digits)
 * @returns {string} Formatted string: +91 9876543210
 */
export const formatPhoneNumber = (phoneNumber) => {
    const normalized = normalizePhoneNumber(phoneNumber);
    return `+${normalized.slice(0, 2)} ${normalized.slice(2)}`;
};

/**
 * Extract 10-digit number without country code
 * @param {string} phoneNumber - Phone number with or without prefix
 * @returns {string} 10-digit number string
 */
export const getDigitsOnly = (phoneNumber) => {
    const normalized = normalizePhoneNumber(phoneNumber);
    return normalized.slice(2); // Remove 91 prefix
};
