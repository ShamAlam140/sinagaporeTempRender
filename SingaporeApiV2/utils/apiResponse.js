/**
 * Standardized API response utility.
 * Use these throughout routes for consistent response format.
 *
 * Usage:
 *   const { success, error } = require('../utils/apiResponse');
 *   return success(res, data, 'Employee created', 201);
 *   return error(res, 'Not found', 404);
 */

/**
 * Send a success response.
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}

/**
 * Send an error response.
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errors - Optional validation errors
 */
function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
        success: false,
        message,
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
}

module.exports = { success, error };
