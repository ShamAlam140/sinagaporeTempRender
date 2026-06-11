const mongoose = require('mongoose');

const LeaveReportSchema = mongoose.Schema({
    staff: { type: String, required: true },
    previous: { type: Number, required: true },
    current: { type: Number, required: true },
    total: { type: Number, required: true },
    utilised: { type: Number, required: true },
    remaining: { type: Number, required: true },
    sick: { type: Number, required: true },
    sickUtilised: { type: Number, required: true },
    sickRemaining: { type: Number, required: true },
});

module.exports = mongoose.model('leavereport', LeaveReportSchema);
