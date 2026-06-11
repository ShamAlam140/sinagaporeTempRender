const mongoose = require('mongoose');

const SuperAdminSchema = mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: String, required: true },
    jdate: { type: String, required: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('superadmins', SuperAdminSchema);
