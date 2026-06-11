/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns consistent JSON responses.
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ msg: 'Validation error', errors: messages });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ msg: 'Invalid ID format' });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({ msg: 'Duplicate entry found' });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        msg: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
