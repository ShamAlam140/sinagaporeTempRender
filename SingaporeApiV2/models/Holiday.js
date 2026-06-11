const mongoose = require('mongoose');

const HolidaySchema = mongoose.Schema({
    title: { type: String, required: false },
    start: { type: String, required: true },
    end: { type: String, required: true },
    color: { type: String, required: false },
    type: { type: String, required: false },
});

module.exports = mongoose.model('holidays', HolidaySchema);
