const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Holiday = require('../models/Holiday');
const mongoose = require('mongoose');

const calendarService = require('../services/calendarService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const leaveBalanceService = require('../services/leaveBalanceService');
const { clearCache } = require('../services/cacheService');
const dateUtils = require('../utils/dateUtils');
const { rangesOverlap, isSameDay } = require('../utils/dateUtils');

exports.applyLeave = async (req, res) => {
    const { id } = req.query;

    // Start MongoDB Session for Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const employer = await Employee.findById(id).session(session);
        if (!employer) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json('Employer not found');
        }

        const { fromDate, toDate, halftype, hid, type } = req.body;
        if (!fromDate || !toDate) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'fromDate and toDate are required.' });
        }
        if (!type || !String(type).trim()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Leave type is required.' });
        }

        const newFrom = new Date(fromDate);
        const newTo = new Date(toDate);
        if (isNaN(newFrom.getTime()) || isNaN(newTo.getTime())) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        // Calculate secure count on the server (resolves Point 1: Security Flaw)
        const holidays = await Holiday.find({ type: { $ne: 'leave' } }).lean();
        const calculatedCount = dateUtils.calculateActualLeaveDays(newFrom, newTo, halftype, holidays);

        console.log(`[DEBUG LEAVE] fromDate=${newFrom}, toDate=${newTo}, halftype=${halftype}`);
        console.log(`[DEBUG LEAVE] calculatedCount=${calculatedCount}`);

        req.body.count = calculatedCount;

        // Secure Balance Check
        let currYear = new Date().getFullYear();
        let leaveBalance = employer.leaveType.find(x => x.type === type && x.year === currYear);
        if (!leaveBalance || (leaveBalance.remaining - calculatedCount) < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Leave not Applied! Your Leave Request exceeds the limit.' });
        }

        // ---- Date conflict detection ----
        let isDateConflict = false;
        for (const leave of employer.leave || []) {
            if (String(leave.status || '').toLowerCase() === 'denied') continue;
            if (String(leave.stage || '').toLowerCase() === 'close') continue;

            const existingFrom = new Date(leave.fromDate);
            const existingTo = new Date(leave.toDate);

            if (isNaN(existingFrom.getTime()) || isNaN(existingTo.getTime())) continue;

            if (rangesOverlap(newFrom, newTo, leave.fromDate, leave.toDate)) {
                // Check if it's the exact same single day, allowing different half-days
                const isSameDayLoc = isSameDay(newFrom, newTo) &&
                    isSameDay(existingFrom, existingTo) &&
                    isSameDay(newFrom, existingFrom);

                if (isSameDayLoc &&
                    Number(leave.count) === 0.5 &&
                    Number(req.body.count) === 0.5 &&
                    leave.halftype &&
                    halftype &&
                    leave.halftype !== halftype) {
                    continue; // Different half-days on same day — OK
                }

                isDateConflict = true;
                break;
            }
        }

        if (isDateConflict) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Leave for this date range already exists.' });
        }

        // ---- Create Calendar Entry & Generate hid ----
        try {
            const calendarEntry = await calendarService.createLeaveCalendarEntry(employer, newFrom, newTo);
            req.body.hid = calendarEntry._id.toString();
        } catch (err) {
            console.error('Failed to create calendar entry before saving leave:', err);
            req.body.hid = new mongoose.Types.ObjectId().toString();
        }

        // ---- Push leave to employee document ----
        employer.leave.push(req.body);
        await employer.save({ session }); // Use transaction session

        // COMMIT TRANSACTION
        await session.commitTransaction();
        session.endSession();
        clearCache('/api/employee');

        // ---- Send email to reporting managers (non-blocking) ----
        const leaveData = req.body;
        emailService.sendLeaveApplicationEmail(employer, leaveData).catch(err => {
            console.error('⚠️ Email failed but leave saved:', err.message);
        });

        res.json(employer.leave);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction aborted due to error:', error);
        res.status(500).json({ message: 'Internal Server Error during transaction.' });
    }
};

exports.updateApprove1 = async (req, res) => {
    const { id, hid, approve1, mngcomment } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find employee and update approve1 + mngcomment
        const updateSet = { 'leave.$.approve1': approve1 };
        if (mngcomment !== undefined) {
            updateSet['leave.$.mngcomment'] = mngcomment;
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: id, 'leave.hid': hid },
            { $set: updateSet },
            { new: true, session }
        );

        if (!updatedEmployee) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Leave record not found' });
        }

        // 2. Find the leave item for email
        const leaveItem = (updatedEmployee.leave || []).find(l => String(l.hid) === String(hid));

        // COMMIT TRANSACTION
        await session.commitTransaction();
        session.endSession();
        clearCache('/api/employee');

        // 3. Update calendar color to darkblue (RM1 approved, waiting for RM2) (non-blocking)
        calendarService.updateCalendarColor(hid, 'darkblue')
            .then(() => clearCache('/api/holidays'))
            .catch(() => { });

        // 4. Send email to RM2 (non-blocking)
        if (leaveItem && approve1 === true) {
            emailService.sendApprove1Email(updatedEmployee, leaveItem).catch(err => {
                console.error('⚠️ Approve1 email failed:', err.message);
            });
        }

        res.status(200).json(updatedEmployee);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction aborted due to error:', error);
        res.status(500).json({ message: 'Internal Server Error during transaction.' });
    }
};

exports.updateApprove2 = async (req, res) => {
    const { id, hid, approve2, mngcomment } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find the employee
        const employee = await Employee.findById(id).session(session);
        if (!employee) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Employee not found' });
        }

        // 2. Find the leave entry
        const leaveIndex = (employee.leave || []).findIndex(l => String(l.hid) === String(hid));
        if (leaveIndex === -1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Leave record not found' });
        }

        const leaveItem = employee.leave[leaveIndex];

        // 3. Set approve2 + mngcomment
        employee.leave[leaveIndex].approve2 = approve2;
        if (mngcomment !== undefined) {
            employee.leave[leaveIndex].mngcomment = mngcomment;
        }

        // 4. If approve2 = true AND approve1 is already true → FULLY APPROVED
        if (approve2 === true && leaveItem.approve1 === true) {
            // Set status to Approved
            employee.leave[leaveIndex].status = 'Approved';

            // 5. Deduct leave balance
            const deductResult = leaveBalanceService.deductLeaveBalance(
                employee, leaveItem.type, Number(leaveItem.count) || 0
            );
            if (!deductResult.success) {
                console.log('⚠️ Balance deduction warning:', deductResult.error);
                // Still approve — don't block on balance issues
            }
        }

        employee.markModified('leave');
        await employee.save({ session });

        // COMMIT TRANSACTION
        await session.commitTransaction();
        session.endSession();
        clearCache('/api/employee');

        // 6. Update calendar color (non-blocking)
        if (approve2 === true && leaveItem.approve1 === true) {
            calendarService.updateCalendarColor(hid, 'green')
                .then(() => clearCache('/api/holidays'))
                .catch(() => { });

            // 7. Send full approval email to everyone (non-blocking)
            let fromManagerEmails = [];
            try {
                const allManagers = await Manager.find({}, 'managerEmail').lean();
                fromManagerEmails = allManagers.map(m => m.managerEmail);
            } catch (e) { }

            emailService.sendFullApprovalEmail(employee, leaveItem, fromManagerEmails).catch(err => {
                console.error('⚠️ Full approval email failed:', err.message);
            });

            // 8. Add notifications (non-blocking)
            notificationService.addApprovalNotification(id, leaveItem).catch(() => { });
            notificationService.addCoveringOfficerNotifications(employee, leaveItem).catch(() => { });
        }

        res.status(200).json(employee);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction aborted due to error:', error);
        res.status(500).json({ message: 'Internal Server Error during transaction.' });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    const { id, tid, status } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find the employee
        const employee = await Employee.findById(id).session(session);
        if (!employee) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Find the leave entry
        const leaveIndex = (employee.leave || []).findIndex(l => String(l.hid) === String(tid));
        if (leaveIndex === -1) {
            // Fallback: try findOneAndUpdate (backward compat)
            const updated = await Employee.findOneAndUpdate(
                { _id: id, 'leave.hid': tid },
                { $set: { 'leave.$.status': status } },
                { new: true, session }
            );
            if (!updated) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'Leave record not found' });
            }
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json(updated);
        }

        const leaveItem = employee.leave[leaveIndex];
        const wasApproved = leaveItem.status === 'Approved';

        // 2. Update status
        employee.leave[leaveIndex].status = status;
        employee.markModified('leave');

        // 3. If DENIED and was previously Approved → restore balance
        if (status === 'Denied' && wasApproved) {
            leaveBalanceService.restoreLeaveBalance(employee, leaveItem.type, Number(leaveItem.count) || 0);
        }

        await employee.save({ session });

        await session.commitTransaction();
        session.endSession();
        clearCache('/api/employee');

        // 4. Update calendar color (non-blocking)
        if (status === 'Denied') {
            calendarService.updateCalendarColor(tid, 'red')
                .then(() => clearCache('/api/holidays'))
                .catch(() => { });
            // Send denial notification (non-blocking)
            notificationService.addDenialNotification(id, leaveItem).catch(() => { });

            // Send Denial Email (non-blocking)
            // Use a placeholder manager name if the request doesn't provide it directly
            const managerName = req.body.managerName || 'Your Reporting Manager';
            emailService.sendDenialEmail(employee, leaveItem, managerName).catch(err => {
                console.error('⚠️ Denial email failed:', err.message);
            });
        } else if (status === 'Approved') {
            calendarService.updateCalendarColor(tid, 'green')
                .then(() => clearCache('/api/holidays'))
                .catch(() => { });
        }

        res.status(200).json(employee);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction aborted due to error:', error);
        res.status(500).json({ message: 'Internal Server Error during transaction.' });
    }
};

exports.updateLeaveComplex = async (req, res) => {
    const { email, hid } = req.params;
    const updateFields = req.body || {};
    const hasTypeUpdateField =
        Object.prototype.hasOwnProperty.call(updateFields, 'leave.$.type') ||
        Object.prototype.hasOwnProperty.call(updateFields, 'type');
    const requestedTypeRaw = hasTypeUpdateField
        ? (Object.prototype.hasOwnProperty.call(updateFields, 'leave.$.type')
            ? updateFields['leave.$.type']
            : updateFields.type)
        : undefined;

    const wantsToCancel = (
        updateFields['leave.$.status'] === 'Denied' ||
        updateFields['leave.$.stage'] === 'Close' ||
        updateFields.status === 'Denied' ||
        updateFields.stage === 'Close'
    );

    const wantsToApprove = (
        updateFields['leave.$.status'] === 'Approved' ||
        updateFields.status === 'Approved'
    );

    // Start MongoDB Session for Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const employer = await Employee.findOne({ empEmail: email }).session(session);
        if (!employer) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Employee not found' });
        }

        const leaveIndex = (employer.leave || []).findIndex(l => String(l.hid) === String(hid));
        if (leaveIndex === -1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Leave entry not found' });
        }

        const leaveItem = employer.leave[leaveIndex];
        const isApproved = String(leaveItem.status || '').toLowerCase() === 'approved';
        const now = Date.now();

        // Keep apply/edit parity: if caller is updating type, it cannot be empty.
        if (hasTypeUpdateField && !String(requestedTypeRaw || '').trim()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Leave type is required.' });
        }

        // ---- Determine target dates ----
        const targetFrom = updateFields['leave.$.fromDate'] || updateFields.fromDate || leaveItem.fromDate;
        const targetTo = updateFields['leave.$.toDate'] || updateFields.toDate || leaveItem.toDate;
        const targetFromTime = new Date(targetFrom).getTime();
        const targetToTime = new Date(targetTo).getTime();

        if (isNaN(targetFromTime) || isNaN(targetToTime)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Invalid target fromDate/toDate' });
        }

        // ---- Server-side count recalculation when dates change ----
        const datesChanged = (
            (updateFields['leave.$.fromDate'] || updateFields.fromDate) ||
            (updateFields['leave.$.toDate'] || updateFields.toDate)
        );
        const halftype = updateFields['leave.$.halftype'] || updateFields.halftype || leaveItem.halftype;

        if (datesChanged) {
            const holidays = await Holiday.find({ type: { $ne: 'leave' } }).lean();
            const recalculatedCount = dateUtils.calculateActualLeaveDays(
                new Date(targetFrom), new Date(targetTo), halftype, holidays
            );
            // Override any client-sent count with server-calculated value
            updateFields['leave.$.count'] = recalculatedCount;
            if (updateFields.count !== undefined) updateFields.count = recalculatedCount;
        }

        // ---- APPROVAL: block overlapping ----
        if (wantsToApprove) {
            const hasOverlap = (employer.leave || []).some(l => {
                if (!l || !l.fromDate || !l.toDate) return false;
                if (String(l.hid) === String(hid)) return false;
                if (String(l.status || '').toLowerCase() === 'denied') return false;
                if (String(l.stage || '').toLowerCase() === 'close') return false;

                if (rangesOverlap(targetFrom, targetTo, l.fromDate, l.toDate)) {
                    const reqCount = updateFields['leave.$.count'] !== undefined ? Number(updateFields['leave.$.count']) : (updateFields.count !== undefined ? Number(updateFields.count) : Number(leaveItem.count));
                    const halftype = updateFields['leave.$.halftype'] || updateFields.halftype || leaveItem.halftype;

                    const isSameDayLoc = isSameDay(targetFrom, targetTo) &&
                        isSameDay(l.fromDate, l.toDate) &&
                        isSameDay(targetFrom, l.fromDate);

                    if (isSameDayLoc &&
                        Number(l.count) === 0.5 &&
                        reqCount === 0.5 &&
                        l.halftype &&
                        halftype &&
                        l.halftype !== halftype) {
                        return false; // Different half-days on same day — OK
                    }
                    return true;
                }
                return false;
            });
            if (hasOverlap) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Cannot approve: overlaps with another non-denied leave.' });
            }
            if (targetFromTime <= now) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Cannot approve a leave that starts in the past.' });
            }
        }

        // ---- Block past-approved leave edits ----
        const existingFromTime = new Date(leaveItem.fromDate).getTime();
        if (isApproved && existingFromTime <= now) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cannot edit or cancel a past approved leave.' });
        }

        // ---- TYPE CHANGE for approved future leave ----
        const newType = hasTypeUpdateField ? String(requestedTypeRaw).trim() : undefined;
        const oldType = leaveItem.type;
        const isTypeChange = isApproved && newType && String(newType).toLowerCase() !== String(oldType).toLowerCase();

        if (isTypeChange) {
            const days = Number(leaveItem.count) || 0;
            const swapResult = leaveBalanceService.swapLeaveType(employer, oldType, newType, days);
            if (!swapResult.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: swapResult.error });
            }

            // Apply all update fields
            for (const key in updateFields) {
                if (key.startsWith('leave.$.')) {
                    employer.leave[leaveIndex][key.replace('leave.$.', '')] = updateFields[key];
                } else if (['fromDate', 'toDate', 'count', 'mngcomment', 'reason', 'stage', 'pcount', 'certificate', 'halftype', 'reportingManager1', 'reportingManager2', 'coveringofficer'].includes(key)) {
                    employer.leave[leaveIndex][key] = updateFields[key];
                }
            }
            employer.leave[leaveIndex].type = newType;
            employer.leave[leaveIndex].status = 'Pending';
            employer.leave[leaveIndex].approve1 = false;
            employer.leave[leaveIndex].approve2 = false;

            employer.markModified('leaveType');
            employer.markModified('leave');
            await employer.save({ session });

            await session.commitTransaction();
            session.endSession();
            clearCache('/api/employee');

            // Send email asynchronously in the background
            emailService.sendLeaveApplicationEmail(employer, employer.leave[leaveIndex]).catch(err => {
                console.error('Failed to send email after type change:', err.message);
            });

            return res.status(200).json({ message: 'Leave type changed successfully', updatedRecord: employer });
        }

        // ---- CANCEL / DENY LEAVE ----
        if (wantsToCancel) {
            // Revert balance if it was approved
            if (isApproved) {
                const days = Number(leaveItem.count) || 0;
                leaveBalanceService.restoreLeaveBalance(employer, leaveItem.type, days);
            }

            for (const key in updateFields) {
                if (key.startsWith('leave.$.')) {
                    employer.leave[leaveIndex][key.replace('leave.$.', '')] = updateFields[key];
                } else if (['stage', 'status', 'pcount', 'mngcomment'].includes(key)) {
                    employer.leave[leaveIndex][key] = updateFields[key];
                }
            }
            employer.leave[leaveIndex].status = 'Denied';
            employer.leave[leaveIndex].stage = employer.leave[leaveIndex].stage || 'Close';

            employer.markModified('leave');

            if (isApproved) {
                employer.markModified('leaveType');
            }
            await employer.save({ session });

            await session.commitTransaction();
            session.endSession();
            clearCache('/api/employee');

            // Update calendar color (non-blocking)
            calendarService.updateCalendarColor(hid, 'red')
                .then(() => clearCache('/api/holidays'))
                .catch(() => { });

            // Send Denial Email (non-blocking)
            const managerName = 'Your Reporting Manager'; // Cancelled/Denied directly
            emailService.sendDenialEmail(employer, employer.leave[leaveIndex], managerName).catch(err => {
                console.error('⚠️ Denial email failed on cancel:', err.message);
            });

            return res.status(200).json({ message: 'Leave cancelled/denied and balance restored', updatedRecord: employer });
        }

        // ---- SAME-TYPE EDIT for approved future leave ----
        if (isApproved) {
            for (const key in updateFields) {
                if (key.startsWith('leave.$.')) {
                    employer.leave[leaveIndex][key.replace('leave.$.', '')] = updateFields[key];
                } else if (['fromDate', 'toDate', 'mngcomment', 'reason', 'pcount', 'stage', 'certificate', 'halftype'].includes(key)) {
                    employer.leave[leaveIndex][key] = updateFields[key];
                }
            }
            employer.leave[leaveIndex].status = 'Pending';
            employer.leave[leaveIndex].approve1 = false;
            employer.leave[leaveIndex].approve2 = false;
            employer.markModified('leave');
            await employer.save({ session });

            await session.commitTransaction();
            session.endSession();
            clearCache('/api/employee');

            // Send email asynchronously in the background
            emailService.sendLeaveApplicationEmail(employer, employer.leave[leaveIndex]).catch(err => {
                console.error('Failed to send email after same-type edit:', err.message);
            });

            return res.status(200).json({ message: 'Approved leave edited successfully', updatedRecord: employer });
        }

        // ---- REGULAR UPDATE (Pending/Denied) ----
        // Date conflict check
        const newFrom = updateFields['leave.$.fromDate'] || updateFields.fromDate;
        const newTo = updateFields['leave.$.toDate'] || updateFields.toDate;

        if (newFrom || newTo) {
            const checkFrom = newFrom || leaveItem.fromDate;
            const checkTo = newTo || leaveItem.toDate;

            const conflict = (employer.leave || []).some(l => {
                if (!l || !l.fromDate || !l.toDate) return false;
                if (String(l.hid) === String(hid)) return false;
                if (String(l.status || '').toLowerCase() === 'denied') return false;
                if (String(l.stage || '').toLowerCase() === 'close') return false;

                if (rangesOverlap(checkFrom, checkTo, l.fromDate, l.toDate)) {
                    const reqCount = updateFields['leave.$.count'] !== undefined ? Number(updateFields['leave.$.count']) : (updateFields.count !== undefined ? Number(updateFields.count) : Number(leaveItem.count));
                    const halftype = updateFields['leave.$.halftype'] || updateFields.halftype || leaveItem.halftype;

                    const isSameDayLoc = isSameDay(checkFrom, checkTo) &&
                        isSameDay(l.fromDate, l.toDate) &&
                        isSameDay(checkFrom, l.fromDate);

                    if (isSameDayLoc &&
                        Number(l.count) === 0.5 &&
                        reqCount === 0.5 &&
                        l.halftype &&
                        halftype &&
                        l.halftype !== halftype) {
                        return false; // Different half-days on same day — OK
                    }
                    return true;
                }
                return false;
            });

            if (conflict) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Leave for this date range already exists.' });
            }
        }

        // Apply fields directly on the loaded document instead of findOneAndUpdate
        for (const key in updateFields) {
            if (key.startsWith('leave.$.')) {
                employer.leave[leaveIndex][key.replace('leave.$.', '')] = updateFields[key];
            } else if (['fromDate', 'toDate'].includes(key)) {
                employer.leave[leaveIndex][key] = updateFields[key];
            }
        }

        employer.markModified('leave');
        await employer.save({ session });

        await session.commitTransaction();
        session.endSession();
        clearCache('/api/employee');

        if (newFrom || newTo) {
            calendarService.updateCalendarDates(hid, newFrom, newTo).catch(() => { });
        }

        const isNowDenied = String(employer.leave[leaveIndex].status).toLowerCase() === 'denied';

        if (isNowDenied) {
            const managerName = 'Your Reporting Manager';
            emailService.sendDenialEmail(employer, employer.leave[leaveIndex], managerName).catch(err => {
                console.error('Failed to send denial email after edit:', err.message);
            });
        } else {
            // Send Application email asynchronously in the background for regular pending updates
            emailService.sendLeaveApplicationEmail(employer, employer.leave[leaveIndex]).catch(err => {
                console.error('Failed to send email after pending edit:', err.message);
            });
        }

        res.status(200).json({ message: 'Leave updated successfully', updatedRecord: employer });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Transaction aborted due to error:', error);
        res.status(500).json({ message: 'Internal Server Error during transaction.' });
    }
};
