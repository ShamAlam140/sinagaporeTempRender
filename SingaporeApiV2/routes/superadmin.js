const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const SuperAdmin = require('../models/SuperAdmin');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/login', [
    check('email', 'type your email').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
], asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ errors: errors.array() });

    const admin = await SuperAdmin.findOne({ email });
    if (!admin) return res.status(401).json('Not Found');
    if (password !== admin.password) return res.status(401).json('password dont match');

    res.json(admin);
}));

router.get('/details/:id', asyncHandler(async (req, res) => {
    const result = await SuperAdmin.findById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(result);
}));

module.exports = router;
