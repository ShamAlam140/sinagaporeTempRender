const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');
const SuperAdmin = require('../models/SuperAdmin');
const asyncHandler = require('../middleware/asyncHandler');
const { clearCache } = require('../services/cacheService');

// Login
router.post('/login', asyncHandler(async (req, res) => {
    const { managerEmail, managerPassword } = req.body;
    const manager = await Manager.findOne({ managerEmail });
    if (!manager) return res.status(401).json('Not Found');
    if (managerPassword !== manager.managerPassword) return res.status(401).json('password dont match');
    res.json(manager);
}));

// Add manager (HR auth)
router.post('/addmanager', [
    check('managerName', 'Manager name is required').not().isEmpty(),
    check('managerUserName', 'Username is required').not().isEmpty(),
    check('managerEmail', 'Valid email is required').isEmail(),
], asyncHandler(async (req, res) => {
    const { hr_key } = req.query;
    const hr = await SuperAdmin.findById(hr_key);
    if (!hr) return res.status(401).json({ msg: 'unauthorized' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const existingUser = await Manager.findOne({ managerUserName: req.body.managerUserName });
    if (existingUser) return res.status(409).json({ msg: 'Username already exists' });

    const existingEmail = await Manager.findOne({ managerEmail: req.body.managerEmail });
    if (existingEmail) return res.status(409).json({ msg: 'Email already exists' });

    const manager = new Manager(req.body);
    await manager.save();
    clearCache('/api/manager');
    res.json(manager);
}));

// Get manager details
router.get('/details/:id', asyncHandler(async (req, res) => {
    const result = await Manager.findById(req.params.id).lean();
    if (!result) return res.status(404).json({ error: 'Manager not found' });
    res.status(200).json(result);
}));

// Get employees under manager
router.get('/employee/:id', asyncHandler(async (req, res) => {
    const v = req.params.id;
    const result = await Employee.find({ Mid: v }).lean();
    res.status(200).json(result);
}));

// Get all managers (no auth — used by frontend)
router.get('/getleaves', asyncHandler(async (req, res) => {
    const managers = await Manager.find().lean();
    res.json(managers);
}));

// Get all employees (HR auth)
router.get('/getEmployee', asyncHandler(async (req, res) => {
    const { hr_key } = req.query;
    const hr = await SuperAdmin.findById(hr_key).lean();
    if (!hr) return res.status(401).json({ msg: 'unauthorized' });
    const employees = await Manager.find().lean();
    res.json(employees);
}));

// Add employee to reporting list
router.post('/addemployeesReporting', asyncHandler(async (req, res) => {
    const { id } = req.query;
    const manager = await Manager.findById(id);
    if (!manager) return res.status(401).json('Employer not found');
    manager.employeesReporting.push(req.body);
    await manager.save();
    clearCache('/api/manager');
    res.json(manager);
}));

// Update manager
router.post('/updatemanager', asyncHandler(async (req, res) => {
    const { id } = req.query;
    const manager = await Manager.findById(id);
    if (!manager) return res.status(401).json('Employer not found');

    // Safe field whitelist
    const allowedFields = ['managerName', 'managerUserName', 'managerEmail', 'managerDob', 'managerJoined', 'managerPassword', 'employeesReporting', 'notification'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            manager[field] = req.body[field];
        }
    }

    await manager.save();
    clearCache('/api/manager');
    res.send(manager);
}));

// Get all managers (HR auth)
router.get('/getManagers', asyncHandler(async (req, res) => {
    const { hr_key } = req.query;
    const hr = await SuperAdmin.findById(hr_key).lean();
    if (!hr) return res.status(401).json({ msg: 'unauthorized' });
    const managers = await Manager.find().lean();
    res.json(managers);
}));

// Remove manager
router.post('/removemanager', asyncHandler(async (req, res) => {
    const manager = await Manager.findById(req.body.id);
    if (!manager) return res.status(401).json('Manager not found');
    await Manager.deleteOne({ _id: req.body.id });
    clearCache('/api/manager');
    res.status(200).json('Manager Deleted');
}));

module.exports = router;
