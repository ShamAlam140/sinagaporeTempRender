/**
 * Calendar Service — Internal module for managing calendar/holiday entries.
 * Used when leave is applied (create entry), approved/denied (change color).
 */
const Holiday = require('../models/Holiday');
const { clearCache } = require('../services/cacheService');

/**
 * Create a calendar entry for a leave application.
 * Returns the created holiday document (with _id for use as hid).
 */
async function createLeaveCalendarEntry(employee, fromDate, toDate) {
    try {
        const entry = new Holiday({
            start: new Date(fromDate).toISOString(),
            end: new Date(toDate).toISOString(),
            title: `L-${employee.empName}`,
            color: 'lightblue',
            type: 'leave',
        });

        await entry.save();
        clearCache('/api/holidays');
        console.log(`✅ Calendar entry created: ${entry._id}`);
        return entry;
    } catch (error) {
        console.error('❌ Failed to create calendar entry:', error.message);
        throw error; // Let the caller handle this
    }
}

/**
 * Update calendar entry color (Approved = green, Denied = red, Pending RM2 = darkblue).
 */
async function updateCalendarColor(entryId, color) {
    try {
        if (!entryId) return;

        const entry = await Holiday.findById(entryId);
        if (!entry) {
            console.log(`⚠️ Calendar entry ${entryId} not found for color update`);
            return;
        }

        entry.color = color;
        await entry.save();
        clearCache('/api/holidays');
        console.log(`✅ Calendar entry ${entryId} color → ${color}`);
    } catch (error) {
        // Calendar color update is not critical — log and continue
        console.error(`⚠️ Failed to update calendar color for ${entryId}:`, error.message);
    }
}

/**
 * Delete a calendar entry.
 */
async function deleteCalendarEntry(entryId) {
    try {
        if (!entryId) return;
        await Holiday.findByIdAndDelete(entryId);
        clearCache('/api/holidays');
        console.log(`✅ Calendar entry ${entryId} deleted`);
    } catch (error) {
        console.error(`⚠️ Failed to delete calendar entry ${entryId}:`, error.message);
    }
}

/**
 * Update calendar dates and optionally title/type.
 */
async function updateCalendarDates(entryId, start, end) {
    try {
        if (!entryId) return;
        const entry = await Holiday.findById(entryId);
        if (!entry) return;

        if (start) entry.start = new Date(start).toISOString();
        if (end) entry.end = new Date(end).toISOString();

        // When edited, revert to pending color if it was approved
        entry.color = 'lightblue';

        await entry.save();
        clearCache('/api/holidays');
        console.log(`✅ Calendar entry ${entryId} dates updated`);
    } catch (error) {
        console.error(`⚠️ Failed to update calendar dates for ${entryId}:`, error.message);
    }
}

module.exports = {
    createLeaveCalendarEntry,
    updateCalendarColor,
    deleteCalendarEntry,
    updateCalendarDates
};
