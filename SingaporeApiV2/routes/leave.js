const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const SuperAdmin = require('../models/SuperAdmin');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/getleaves', asyncHandler(async (req, res) => {
    const leaves = await Leave.find();
    res.json(leaves);
}));

router.post('/addleave', [
    check('ltype', 'ltype is required').not().isEmpty(),
    check('count', 'count is required').not().isEmpty(),
], asyncHandler(async (req, res) => {
    const { hr_key } = req.query;
    const hr = await SuperAdmin.findById(hr_key);
    if (!hr) return res.status(401).json({ msg: 'unauthorized' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ errors: errors.array() });

    const { ltype, count } = req.body;
    const existing = await Leave.findOne({ ltype });
    if (existing) return res.status(401).json({ msg: 'Leave already present' });

    const leave = new Leave({ ltype, count });
    await leave.save();
    res.json(leave);
}));

module.exports = router;
