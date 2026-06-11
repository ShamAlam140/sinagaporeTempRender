const SuperAdminSchema = require('../models/SuperAdmin');

/**
 * Middleware to verify HR (SuperAdmin) authorization.
 * Checks hr_key query parameter against SuperAdmin collection.
 */
const verifyHrKey = async (req, res, next) => {
    try {
        const hrKey = req.query.hr_key || process.env.HR_KEY;
        if (!hrKey) {
            return res.status(401).json({ msg: 'Unauthorized: HR key is required' });
        }

        const hr = await SuperAdminSchema.findById(hrKey);
        if (!hr) {
            return res.status(401).json({ msg: 'Unauthorized: Invalid HR key' });
        }

        req.hrAdmin = hr;
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Unauthorized: Invalid HR key' });
    }
};

module.exports = { verifyHrKey };
