const mongoose = require('mongoose');

const CoverSchema = mongoose.Schema({
    empName: { type: String, required: true },
    cEmpName: { type: String, required: true },
    status: { type: String, required: true },
    leave: {},
});

module.exports = mongoose.model('covers', CoverSchema);
