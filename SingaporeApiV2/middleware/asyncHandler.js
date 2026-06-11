/**
 * Async handler wrapper — eliminates try/catch boilerplate in route handlers.
 * Catches any thrown error and passes it to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
