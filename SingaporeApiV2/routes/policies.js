const express = require('express');
const router = express.Router();
const { isConfigured, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const upload = require('../middleware/upload');
const Policy = require('../models/Policy');
const SuperAdmin = require('../models/SuperAdmin');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/getpolicies', asyncHandler(async (req, res) => {
    const policies = await Policy.find();
    res.json(policies);
}));

router.post('/addpolicy', upload.single('policy'), asyncHandler(async (req, res) => {
    const { hr_key } = req.query;
    const hr = await SuperAdmin.findById(hr_key);
    if (!hr) return res.status(401).json({ msg: 'Unauthorized' });

    if (!req.file) return res.json({ msg: 'No file uploaded' });
    if (!isConfigured) return res.status(500).json({ msg: 'Cloud storage not configured' });

    const file = req.file;
    const { secure_url, public_id } = await uploadToCloudinary(file.buffer, 'policies', file.originalname);

    const policy = new Policy({ name: file.originalname, plink: secure_url, publicId: public_id });
    await policy.save();
    res.status(200).json(policy);
}));

router.get('/downloadpolicy/:id', asyncHandler(async (req, res) => {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(401).json({ msg: 'policy not found' });

    // plink is now a direct Cloudinary URL — return it as-is
    res.json(policy.plink);
}));

router.post('/remove', asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ msg: 'Policy ID is required' });

    const policy = await Policy.findById(id);
    if (!policy) return res.status(404).json({ msg: 'Policy not found' });

    // Delete from Cloudinary if we have the public_id
    if (policy.publicId) {
        try {
            await deleteFromCloudinary(policy.publicId);
        } catch (err) {
            console.warn('⚠️ Could not delete from Cloudinary:', err.message);
        }
    }

    await Policy.findByIdAndDelete(id);
    res.status(200).json({ msg: 'Policy deleted successfully' });
}));

module.exports = router;
