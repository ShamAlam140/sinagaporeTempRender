const mongoose = require('mongoose');

const PolicySchema = mongoose.Schema({
    sno: { type: Number, required: false },
    plink: { type: String, required: true },
    publicId: { type: String, required: false },
    name: { type: String, required: false },
});

module.exports = mongoose.model('policies', PolicySchema);
