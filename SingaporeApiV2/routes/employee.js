/**
 * Employee Routes
 * Logic has been refactored and extracted to controllers/employeeController.js
 */
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const SuperAdmin = require('../models/SuperAdmin');
const Manager = require('../models/Manager');
const asyncHandler = require('../middleware/asyncHandler');
const { verifyHrKey } = require('../middleware/auth');
const { generateTid, generateId } = require('../utils/idGenerator');
const { cache, clearCache } = require('../services/cacheService');

// Controllers
const employeeController = require('../controllers/employeeController');
const leaveController = require('../controllers/leaveController');

// ============================================================
// AUTH
// ============================================================

router.post('/login', [
    check('empEmail', 'Email is required').not().isEmpty(),
    check('empPassword', 'Password is required').not().isEmpty(),
], asyncHandler(async (req, res) => {
    const { empEmail, empPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array() });
    }

    const employer = await Employee.findOne({ empEmail });
    if (!employer) {
        return res.status(401).json('Not Found');
    }
    if (empPassword !== employer.empPassword) {
        return res.status(401).json('password dont match');
    }

    res.json(employer);
}));

// ============================================================
// CRUD FROM CONTROLLER
// ============================================================

router.get('/details', cache(60), asyncHandler(employeeController.getEmployeeDetails));
router.get('/getEmployee', cache(60), asyncHandler(employeeController.getAllEmployees));
router.get('/geteveryemployee', cache(60), asyncHandler(employeeController.getEveryEmployee));
router.post('/addemployee', [
    check('empName', 'Employee name is required').not().isEmpty(),
    check('empUserName', 'Username is required').not().isEmpty(),
    check('empEmail', 'Valid email is required').isEmail(),
    check('empPassword', 'Password must be at least 4 characters').isLength({ min: 4 }),
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return employeeController.addEmployee(req, res, next);
}));
router.post('/deleteemployee', asyncHandler(employeeController.deleteEmployee));
router.post('/additional', asyncHandler(employeeController.updateAdditionalInfo));
router.post('/addleavetype', asyncHandler(employeeController.addLeaveType));
router.post('/updateleaveType/:email/:tid', asyncHandler(employeeController.updateLeaveType));

// ============================================================
// ARRAY PULL OPERATIONS (Deleting embedded items)
// ============================================================

router.post('/deleteleavetype', asyncHandler(async (req, res) => {
    const { id, tid } = req.body;
    const employee = await Employee.findByIdAndUpdate(
        id,
        { $pull: { leaveType: { tid: tid } } },
        { new: true }
    );
    if (!employee) return res.status(404).send('Employee not found or leave type not found');
    clearCache('/api/employee');
    res.status(200).json({ message: 'Leave type removed successfully', employee });
}));

router.post('/deletenotification', asyncHandler(async (req, res) => {
    const { id, notificationId } = req.body;
    const employee = await Employee.findByIdAndUpdate(
        id,
        { $pull: { notification: { _id: notificationId } } },
        { new: true }
    );
    if (!employee) return res.status(404).send('Employee not found or notification not found');
    clearCache('/api/employee');
    res.status(200).json({ message: 'Notification removed successfully', employee });
}));

// ============================================================
// LEAVE CONTROLLER ROUTES
// ============================================================
router.post('/applyleave', asyncHandler(leaveController.applyLeave));
router.post('/updateapprove1', asyncHandler(leaveController.updateApprove1));
router.post('/updateapprove2', asyncHandler(leaveController.updateApprove2));
router.post('/updateleavestatus', asyncHandler(leaveController.updateLeaveStatus));
router.post('/updateleave/:email/:hid', asyncHandler(leaveController.updateLeaveComplex));
router.post('/deleteleave', asyncHandler(leaveController.deleteLeave));

module.exports = router;
