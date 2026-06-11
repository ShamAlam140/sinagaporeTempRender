const mongoose = require('mongoose');

const LeaveSchema = mongoose.Schema({
    ltype: { type: String, required: true },
    count: { type: Number, required: false },
});

module.exports = mongoose.model('leaves', LeaveSchema);
