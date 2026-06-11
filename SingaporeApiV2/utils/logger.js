/**
 * Structured logger — replaces scattered console.log/console.error.
 *
 * Usage:
 *   const logger = require('../utils/logger');
 *   logger.info('Server started on port 3000');
 *   logger.error('Database connection failed', error);
 *   logger.warn('Cache miss for key', key);
 *   logger.debug('Request body:', body);
 *
 * Log levels (by NODE_ENV):
 *   production  → warn, error only
 *   development → debug, info, warn, error
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

const ENV = process.env.NODE_ENV || 'development';
const MIN_LEVEL = ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

function getTimestamp() {
    return new Date().toISOString();
}

function formatMessage(level, message, ...args) {
    const prefix = `[${getTimestamp()}] [${level}]`;
    return [prefix, message, ...args];
}

const logger = {
    debug(message, ...args) {
        if (MIN_LEVEL <= LOG_LEVELS.DEBUG) {
            console.log(...formatMessage('DEBUG', message, ...args));
        }
    },

    info(message, ...args) {
        if (MIN_LEVEL <= LOG_LEVELS.INFO) {
            console.log(...formatMessage('INFO', message, ...args));
        }
    },

    warn(message, ...args) {
        if (MIN_LEVEL <= LOG_LEVELS.WARN) {
            console.warn(...formatMessage('WARN', message, ...args));
        }
    },

    error(message, ...args) {
        if (MIN_LEVEL <= LOG_LEVELS.ERROR) {
            console.error(...formatMessage('ERROR', message, ...args));
        }
    },
};

module.exports = logger;
