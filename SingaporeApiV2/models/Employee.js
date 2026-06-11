const mongoose = require('mongoose');

// ========= Sub-Schemas for nested arrays =========

const reportingManagerSubSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'managers' },
}, { _id: false });

const coveringEmployeeSubSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'employees' },
}, { _id: false });

const leaveSubSchema = new mongoose.Schema({
    // Legacy production data contains old leave rows without hid/type.
    // Keep these optional at schema level to avoid blocking unrelated updates.
    hid: { type: String, default: '' },
    type: { type: String, default: '' },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    count: { type: Number, default: 0 },
    pcount: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Denied'] },
    approve1: { type: Boolean, default: false },
    approve2: { type: Boolean, default: false },
    mngcomment: { type: String, default: '' },
    halftype: { type: String, default: '' },
    certificate: { type: String, default: '' },
    stage: { type: String, default: '' },
    specialcase: { type: Boolean, default: false },
    email: { type: String, default: '' },
    reportingManager1: { type: mongoose.Schema.Types.Mixed, default: null },
    reportingManager2: { type: mongoose.Schema.Types.Mixed, default: null },
    coveringofficer: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { _id: false });

const leaveTypeSubSchema = new mongoose.Schema({
    tid: { type: String, required: true },
    type: { type: String, required: true },
    count: { type: Number, default: 0 },
    year: { type: Number, default: () => new Date().getFullYear() },
    remaining: { type: Number, default: 0 },
    carried: { type: Number, default: 0 },
    issued: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
}, { _id: false });

const notificationSubSchema = new mongoose.Schema({
    nid: { type: String, required: true },
    leaveTitle: { type: String, default: '' },
    leaveDescription: { type: String, default: '' },
}, { _id: false });

// ========= Main Employee Schema =========

const EmployeeSchema = mongoose.Schema({
    empName: { type: String, required: true },
    empUserName: { type: String, required: true, unique: true },
    empEmail: { type: String, required: true, unique: true },
    empPassword: { type: String, required: false },
    empDob: { type: String, required: false },
    empJoined: { type: String, required: false },
    notification: [notificationSubSchema],
    leave: [leaveSubSchema],
    allCoveringEmployees: [coveringEmployeeSubSchema],
    coveringEmployees: [coveringEmployeeSubSchema],
    cover: [mongoose.Schema.Types.Mixed],
    leaveType: [leaveTypeSubSchema],
    reportingManager: [reportingManagerSubSchema],
}, { timestamps: true });

// Compound index for leave queries
EmployeeSchema.index({ 'leave.hid': 1 });
EmployeeSchema.index({ 'leaveType.tid': 1 });

// Pre-validate hook to ensure all legacy leave records have an hid,
// preventing validation errors when saving a document from production DB
EmployeeSchema.pre('validate', function (next) {
    if (this.leave && Array.isArray(this.leave)) {
        this.leave.forEach(l => {
            if (!l.hid) {
                l.hid = new mongoose.Types.ObjectId().toString();
            }
        });
    }
    next();
});

module.exports = mongoose.model('employees', EmployeeSchema);
