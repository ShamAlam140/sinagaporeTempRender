const mongoose = require('mongoose');

const FileSchema = mongoose.Schema({
    longUrl: { type: String, required: false },
    name: { type: String, required: false },
    urlCode: { type: String, required: false },
    link: { type: String, required: false },
    multi: [],
});

module.exports = mongoose.model('files', FileSchema);
