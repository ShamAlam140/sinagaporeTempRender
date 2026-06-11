const express = require('express');
const router = express.Router();
const { isConfigured, uploadToCloudinary } = require('../config/cloudinary');
const upload = require('../middleware/upload');
const File = require('../models/File');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/getfiles', asyncHandler(async (req, res) => {
    const files = await File.find();
    res.json(files);
}));

router.post('/addfiles', upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) return res.json({ msg: 'No file uploaded' });
    if (!isConfigured) return res.status(500).json({ msg: 'Cloud storage not configured' });

    const file = req.file;
    const { secure_url } = await uploadToCloudinary(file.buffer, 'files', file.originalname);

    const fileDoc = new File({ name: file.originalname, longUrl: secure_url });
    await fileDoc.save();
    res.status(200).json(fileDoc);
}));

router.get('/downloadfile', asyncHandler(async (req, res) => {
    const { id } = req.query;
    const file = await File.findById(id);
    if (!file) return res.status(401).json({ msg: 'File not found' });
    res.json(file);
}));

router.post('/addmultifiles', upload.array('files'), asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) return res.json({ msg: 'No files uploaded' });
    if (!isConfigured) return res.status(500).json({ msg: 'Cloud storage not configured' });

    const mfiles = [];
    for (const file of req.files) {
        const { secure_url } = await uploadToCloudinary(file.buffer, 'files', file.originalname);
        mfiles.push(secure_url);
    }

    const fileDoc = new File({ multi: mfiles });
    await fileDoc.save();
    res.status(200).json(fileDoc);
}));

module.exports = router;
