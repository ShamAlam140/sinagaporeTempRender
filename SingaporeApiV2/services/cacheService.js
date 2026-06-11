const mcache = require('memory-cache');

/**
 * Middleware for caching API responses in memory.
 * @param {number} duration - Cache duration in seconds
 */
const cache = (duration) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Use URL as cache key
        const key = '__express__' + req.originalUrl || req.url;
        const cachedBody = mcache.get(key);

        if (cachedBody) {
            console.log(`✅ CACHE HIT: ${key}`);
            return res.json(JSON.parse(cachedBody));
        } else {
            console.log(`❌ CACHE MISS: ${key}`);
            // Intercept res.json
            res.sendResponse = res.json;
            res.json = (body) => {
                mcache.put(key, JSON.stringify(body), duration * 1000);
                res.sendResponse(body);
            };
            next();
        }
    };
};

/**
 * Clear specific cache key (e.g., when data changes)
 */
const clearCache = (urlStart) => {
    const keys = mcache.keys();
    for (const key of keys) {
        if (key.includes(urlStart)) {
            mcache.del(key);
            console.log(`🧹 CACHE CLEARED: ${key}`);
        }
    }
};

module.exports = { cache, clearCache };
