const express = require('express');
const router = express.Router();
const LeaveReport = require('../models/LeaveReport');
const asyncHandler = require('../middleware/asyncHandler');

// Middleware to check for hr_key
const checkHrKey = (req, res, next) => {
    const hrKey = req.query.hr_key;
    if (hrKey !== process.env.HR_KEY) {
        return res.status(403).json({ message: 'Invalid HR key' });
    }
    next();
};

router.get('/getleaves', asyncHandler(async (req, res) => {
    const leaves = await LeaveReport.find().lean();
    res.json(leaves);
}));

router.post('/addleave', checkHrKey, asyncHandler(async (req, res) => {
    const leave = new LeaveReport(req.body);
    const newLeave = await leave.save();
    res.status(201).json(newLeave);
}));

router.post('/update', asyncHandler(async (req, res) => {
    const { id } = req.query;
    const leave = await LeaveReport.findById(id);
    if (!leave) return res.status(404).json({ message: 'Leave record not found' });

    Object.keys(req.body).forEach(key => { leave[key] = req.body[key]; });
    const updated = await leave.save();
    res.json(updated);
}));

router.post('/removeleave', asyncHandler(async (req, res) => {
    const { id } = req.body;
    const leave = await LeaveReport.findById(id);
    if (!leave) return res.status(404).json({ message: 'Leave record not found' });

    await LeaveReport.findByIdAndDelete(id);
    res.json({ message: 'Leave record deleted' });
}));

module.exports = router;
