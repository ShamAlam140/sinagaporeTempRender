/**
 * Email route — Backward compatibility for frontend's direct email calls.
 * The new backend handles emails internally, but the frontend still calls
 * this endpoint after some actions. This ensures those calls succeed harmlessly.
 */
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/sendmessage', asyncHandler(async (req, res) => {
    const { senderEmail, recieverEmail, subject, message } = req.body;

    if (!senderEmail || !recieverEmail || !subject || !message) {
        return res.status(400).send('All fields are required');
    }

    const result = await emailService.sendGenericEmail(senderEmail, recieverEmail, subject, message);

    if (result.success) {
        res.status(200).send('Email sent successfully');
    } else {
        console.error('Email failed:', result.error);
        // Still return 200 to not break the frontend flow
        res.status(200).send('Email processed');
    }
}));

module.exports = router;
