const Employee = require('../models/Employee');
const SuperAdminSchema = require('../models/SuperAdmin');
const { clearCache } = require('../services/cacheService');
const { generateId } = require('../utils/idGenerator');
const { getDefaultLeaveTypes } = require('../config/leaveDefaults');

exports.addEmployee = async (req, res) => {
    try {
        const existingUser = await Employee.findOne({ empUserName: req.body.empUserName });
        if (existingUser) return res.status(409).json({ msg: 'Username already exists' });

        const existingEmail = await Employee.findOne({ empEmail: req.body.empEmail });
        if (existingEmail) return res.status(409).json({ msg: 'Email already exists' });

        let employee = new Employee({
            ...req.body
        });

        employee.leaveType = getDefaultLeaveTypes(generateId);

        employee = await employee.save();
        if (!employee) return res.status(404).send('The Employee cannot be created!');
        clearCache('/api/employee');
        res.status(200).send(employee);
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ msg: 'Internal server error while adding employee' });
    }
};

exports.deleteEmployee = async (req, res) => {
    const { id } = req.body;
    let employee = await Employee.findByIdAndDelete(id);
    if (!employee) return res.status(404).send('Employee not found');
    clearCache('/api/employee');
    res.status(200).json({ message: 'Employee successfully deleted' });
};

exports.updateAdditionalInfo = async (req, res) => {
    const id = req.query.id;

    const safeFields = [
        'coveringEmployees',
        'allCoveringEmployees',
        'cover',
        'reportingManager',
        'address',
        'phone',
        'jobTitle'
    ];

    const updates = {};
    safeFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const updateDoc = Object.keys(updates).length ? { $set: updates } : {};
    const employee = await Employee.findByIdAndUpdate(
        id,
        updateDoc,
        { new: true, runValidators: true, context: 'query' }
    );

    if (!employee) return res.status(404).send('Employee not found');

    clearCache('/api/employee');
    res.status(200).json(employee);
};

exports.getEmployeeDetails = async (req, res) => {
    const id = req.query.id;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).send('Employee not found');
    res.status(200).json(employee);
};

exports.getAllEmployees = async (req, res) => {
    const id = req.query.hr_key;
    const admin = await SuperAdminSchema.findById(id);
    if (!admin) return res.status(404).send('Unauthorized or HR not found');

    const employees = await Employee.find();
    if (!employees) return res.status(404).send('No employees found');
    res.status(200).json(employees);
};

exports.getEveryEmployee = async (req, res) => {
    const employees = await Employee.find();
    if (!employees) return res.status(404).send('No employees found');
    res.status(200).json(employees);
};

exports.addLeaveType = async (req, res) => {
    const id = req.query.id;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).send('Employee not found');

    let tid = generateId(5);
    let data = { tid, ...req.body };
    employee.leaveType.push(data);
    await employee.save();
    clearCache('/api/employee');
    res.status(200).send("Uploaded Leave Type Successfully");
};

exports.updateLeaveType = async (req, res) => {
    const email = req.params.email;
    const tid = req.params.tid;
    const remaining = req.body['leaveType.$.remaining'];
    const issued = req.body['leaveType.$.issued'];
    const count = req.body['leaveType.$.count'];

    try {
        const employee = await Employee.findOneAndUpdate(
            { empEmail: email, "leaveType.tid": tid },
            {
                $set: {
                    "leaveType.$.remaining": remaining,
                    "leaveType.$.issued": issued,
                    "leaveType.$.count": count
                }
            },
            { new: true }
        );
        if (!employee) return res.status(404).json({ message: 'Employee or leave type not found' });
        clearCache('/api/employee');
        res.json(employee);
    } catch (err) {
        console.error('Error updating leave type:', err);
        res.status(500).send('Server Error');
    }
};
