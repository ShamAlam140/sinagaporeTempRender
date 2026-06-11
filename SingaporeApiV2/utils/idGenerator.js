/**
 * Generate random IDs for leave, notifications, etc.
 */

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a random string of given length.
 */
function generateId(length = 5) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Generate a 4-character TID for leave types.
 */
function generateTid() {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
}

module.exports = { generateId, generateTid };
