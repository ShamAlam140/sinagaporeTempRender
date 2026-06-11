const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Holiday = require('../models/Holiday');
const SuperAdmin = require('../models/SuperAdmin');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const { cache, clearCache } = require('../services/cacheService');

// Get all holidays (public)
router.get('/getholidays', cache(60), asyncHandler(async (req, res) => {
    const holidays = await Holiday.find().lean();
    res.json(holidays);
}));

// Add holiday (HR auth)
router.post('/addholiday', [
    check('title', 'Title is required').not().isEmpty(),
    check('start', 'Start date is required').not().isEmpty(),
    check('end', 'End date is required').not().isEmpty(),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { hr_key } = req.query;
    if (hr_key) {
        const hr = await SuperAdmin.findById(hr_key);
        if (!hr) return res.status(401).json({ msg: 'Unauthorized' });
    }

    const holiday = new Holiday(req.body);
    await holiday.save();
    clearCache('/api/holidays'); // Clear holiday caches

    // Global asynchronous notification
    const notificationService = require('../services/notificationService');
    const description = `${req.body.start} to ${req.body.end}`;
    // Fire and forget
    notificationService.notifyAllEmployees(req.body.title, description).catch(() => { });

    res.json(holiday);
}));

// Remove holiday
router.post('/removeholiday', asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
        return res.status(400).json({ msg: 'Invalid ObjectId format' });
    }

    const holiday = await Holiday.findById(req.body.id);
    if (!holiday) return res.status(404).json({ msg: 'Holiday not found' });

    await Holiday.deleteOne({ _id: req.body.id });
    clearCache('/api/holidays'); // Clear holiday caches
    res.status(200).json({ msg: 'Holiday deleted successfully' });
}));

// Get all holidays (HR auth)
router.get('/getallholidays', cache(60), asyncHandler(async (req, res) => {
    const { hr_key } = req.query;
    const hr = await SuperAdmin.findById(hr_key).lean();
    if (!hr) return res.status(401).json({ msg: 'unauthorized' });
    const holidays = await Holiday.find().lean();
    res.json(holidays);
}));

// Update holiday color
router.post('/update', asyncHandler(async (req, res) => {
    const { color, _id } = req.body;
    const holiday = await Holiday.findById(_id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

    holiday.color = color;
    await holiday.save();
    clearCache('/api/holidays'); // Clear holiday caches
    res.status(200).json({ message: 'Holiday updated successfully' });
}));

module.exports = router;
