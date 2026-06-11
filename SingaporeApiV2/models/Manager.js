const mongoose = require('mongoose');

const notificationSubSchema = new mongoose.Schema({
    nid: { type: String, required: true },
    leaveTitle: { type: String, default: '' },
    leaveDescription: { type: String, default: '' },
}, { _id: false });

const employeeReportingSubSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'employees' },
}, { _id: false });

const ManagerSchema = mongoose.Schema({
    managerName: { type: String, required: true },
    managerUserName: { type: String, required: true, unique: true },
    managerEmail: { type: String, required: true, unique: true },
    managerDob: { type: String, required: true },
    managerJoined: { type: String, required: false },
    managerPassword: { type: String, required: false },
    employeesReporting: [employeeReportingSubSchema],
    notification: [notificationSubSchema],
}, { timestamps: true });

module.exports = mongoose.model('managers', ManagerSchema);
