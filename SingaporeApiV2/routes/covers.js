const express = require('express');
const router = express.Router();
const Cover = require('../models/Cover');
const SuperAdmin = require('../models/SuperAdmin');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/getallcovers', asyncHandler(async (req, res) => {
    const covers = await Cover.find();
    res.json(covers);
}));

router.post('/addcovers', asyncHandler(async (req, res) => {
    const { hr_key } = req.query;
    const hr = await SuperAdmin.findById(hr_key);
    if (!hr) return res.status(401).json({ msg: 'unauthorized' });

    const cover = new Cover(req.body);
    await cover.save();
    res.json(cover);
}));

router.post('/removecover', asyncHandler(async (req, res) => {
    const cover = await Cover.findById(req.body.id);
    if (!cover) return res.status(401).json('Work not found');
    await Cover.deleteOne({ _id: req.body.id });
    res.status(200).json('Employee Deleted');
}));

router.post('/updatecoverstatus', asyncHandler(async (req, res) => {
    const { id } = req.query;
    const cover = await Cover.findById(id);
    if (!cover) return res.status(401).json('Employer not found');
    cover.status = req.body.status;
    await cover.save();
    res.json(cover);
}));

module.exports = router;
