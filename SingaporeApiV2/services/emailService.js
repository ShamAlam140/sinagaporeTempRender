/**
 * Email Service — Internal module for sending emails.
 * Called from within route handlers, NOT as a separate API.
 * Email failures are logged but do NOT break the main transaction.
 */
const nodemailer = require('nodemailer');
const { formatDateStr } = require('../utils/dateUtils');

// Create reusable transporter
let transporter;
try {
    console.log('--------------------------------------------------');
    console.log('📧 [DEBUG] Setting up Email Transporter');
    console.log('📧 [DEBUG] GMAIL_USER:', process.env.GMAIL_USER);
    console.log('📧 [DEBUG] GMAIL_PASS (length):', process.env.GMAIL_PASS ? process.env.GMAIL_PASS.length : 'NOT SET');

    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // must be false for 587, but requireTLS will upgrade it
        requireTLS: true,
        connectionTimeout: 15000, // 15 seconds timeout instead of 60
        greetingTimeout: 15000,
        socketTimeout: 15000,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
        debug: true, // Show SMTP traffic
        logger: true // Log information into console
    });

    console.log('✅ [DEBUG] Email Transporter created successfully with explicitly secure settings.');
    console.log('--------------------------------------------------');
} catch (err) {
    console.error('⚠️ Email transporter creation failed:', err.message);
}

/**
 * Core send function — all other functions use this.
 * Never throws — logs errors and returns success/failure.
 */
async function sendMail(to, subject, text) {
    try {
        if (!transporter) {
            console.error('⚠️ Email transporter not available');
            return { success: false, error: 'Transporter not available' };
        }

        // Filter out empty/null/undefined emails
        const recipients = (Array.isArray(to) ? to : [to]).filter(
            (e) => e && typeof e === 'string' && e.trim() !== ''
        );

        if (recipients.length === 0) {
            console.log('⚠️ No valid recipients for email');
            return { success: false, error: 'No valid recipients' };
        }

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: recipients.join(','),
            subject,
            text,
        };

        console.log(`⏳ [DEBUG] Attempting to send email...`);
        console.log(`⏳ [DEBUG] Subject: "${subject}"`);
        console.log(`⏳ [DEBUG] To: ${recipients.join(',')}`);
        console.log(`⏳ [DEBUG] Waiting for transporter.sendMail...`);

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ [DEBUG] Email sent successfully:', info.response);
        return { success: true, info };
    } catch (error) {
        console.log('--------------------------------------------------');
        console.error('❌ [DEBUG FATAL ERROR] Email send failed!');
        console.error('❌ Code:', error.code);
        console.error('❌ Message:', error.message);
        console.error('❌ Stack:', error.stack);
        console.log('--------------------------------------------------');
        return { success: false, error: error.message };
    }
}

/**
 * Build half-day info string.
 */
function getHalfDayInfo(halftype) {
    if (halftype && halftype.trim() !== '' && halftype.trim() !== ' ') {
        return ` (Half Day - ${halftype.trim()})`;
    }
    return '';
}

/**
 * Send email when employee APPLIES for leave.
 * Recipients: Reporting Manager 1, Employee, Covering Officers
 */
async function sendLeaveApplicationEmail(employee, leave) {
    const rm1 = leave.reportingManager1;
    if (!rm1 || !rm1.email) {
        console.log('⚠️ No reporting manager 1 email for leave application email');
        return;
    }

    const t1 = formatDateStr(leave.fromDate);
    const t2 = formatDateStr(leave.toDate);
    const halfDayInfo = getHalfDayInfo(leave.halftype);

    const recipients = [rm1.email, employee.empEmail];

    // Add covering officer emails
    if (leave.coveringofficer && Array.isArray(leave.coveringofficer)) {
        leave.coveringofficer.forEach((co) => {
            if (co && co.email) recipients.push(co.email);
        });
    }

    const subject = `Application of Leave by ${employee.empName}`;
    const message = `Dear ${rm1.name},\n${employee.empName} has applied for ${leave.type} Leave${halfDayInfo}. From ${t1} to ${t2}. For approval, please.`;

    return sendMail(recipients, subject, message);
}

/**
 * Send email when Manager 1 approves (approve1 = true).
 * Recipients: Reporting Manager 2, Employee, Covering Officers
 */
async function sendApprove1Email(employee, leave) {
    const rm2 = leave.reportingManager2;
    if (!rm2 || !rm2.email) return;

    const t1 = formatDateStr(leave.fromDate);
    const t2 = formatDateStr(leave.toDate);
    const halfDayInfo = getHalfDayInfo(leave.halftype);
    const comment = leave.mngcomment || '';

    const recipients = [rm2.email, employee.empEmail];
    if (leave.coveringofficer && Array.isArray(leave.coveringofficer)) {
        leave.coveringofficer.forEach((co) => {
            if (co && co.email) recipients.push(co.email);
        });
    }

    const subject = `Application of Leave Application by ${employee.empName}`;
    const message = `Dear ${rm2.name},\n${employee.empName} has applied for ${leave.type} Leave${halfDayInfo}. From ${t1} to ${t2}. For approval, please. ${comment}`;

    return sendMail(recipients, subject, message);
}

/**
 * Send email when leave is FULLY APPROVED (both managers approved).
 * Recipients: All managers, Employee, Covering Officers
 */
async function sendFullApprovalEmail(employee, leave, allManagerEmails) {
    const t1 = formatDateStr(leave.fromDate);
    const t2 = formatDateStr(leave.toDate);
    const halfDayInfo = getHalfDayInfo(leave.halftype);
    const comment = leave.mngcomment || '';

    // Build recipient list: all managers + RM1 + RM2 + employee + covering officers
    const recipients = [...(allManagerEmails || [])];

    if (leave.reportingManager1 && leave.reportingManager1.email) {
        recipients.push(leave.reportingManager1.email);
    }
    if (leave.reportingManager2 && leave.reportingManager2.email) {
        recipients.push(leave.reportingManager2.email);
    }
    recipients.push(employee.empEmail);
    if (leave.coveringofficer && Array.isArray(leave.coveringofficer)) {
        leave.coveringofficer.forEach((co) => {
            if (co && co.email) recipients.push(co.email);
        });
    }

    // Deduplicate
    const uniqueRecipients = [...new Set(recipients)];

    // Build covering officer names
    const coveringOfficerNames = [];
    if (leave.coveringofficer && Array.isArray(leave.coveringofficer)) {
        leave.coveringofficer.forEach((co) => {
            if (co && co.name) coveringOfficerNames.push(co.name);
        });
    }

    const futureLeaveTypes = ['Annual', 'RH'];
    const leaveTense = futureLeaveTypes.includes(leave.type) ? 'will be on' : 'was on';

    const subject = `Approval of Leave Application by ${employee.empName}`;
    let message =
        `Dear Colleagues,\n\n` +
        `Please note that ${employee.empName} ${leaveTense} ${leave.type} leave${halfDayInfo} from ${t1} to ${t2}. Thank you.\n`;

    if (coveringOfficerNames.length > 0) {
        message += `Covering Officer during leave period: ${coveringOfficerNames.join(', ')}.\n`;
    }
    if (comment) {
        message += comment;
    }

    return sendMail(uniqueRecipients, subject, message);
}

/**
 * Send email when leave is DENIED.
 * Recipients: Employee
 */
async function sendDenialEmail(employee, leave, managerName) {
    const comment = leave.mngcomment || '';

    const subject = `Denied of Leave Application by ${employee.empEmail}`;
    const message = `Dear ${employee.empName},your leave has been rejected by ${managerName}. For ${comment}. Thank you `;

    return sendMail([employee.empEmail], subject, message);
}

/**
 * Generic send message — backward compatibility for /api/email/sendmessage.
 */
async function sendGenericEmail(senderEmail, recieverEmail, subject, message) {
    return sendMail(recieverEmail, subject, message);
}

module.exports = {
    sendMail,
    sendLeaveApplicationEmail,
    sendApprove1Email,
    sendFullApprovalEmail,
    sendDenialEmail,
    sendGenericEmail,
};
