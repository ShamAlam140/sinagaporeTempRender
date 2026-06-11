/**
 * Date utility functions for leave management.
 * 
 * IMPORTANT: All date functions use SGT (Asia/Singapore, UTC+8) timezone explicitly.
 * The Angular frontend stores dates as midnight SGT, which becomes 16:00 UTC the previous day.
 * On GCP App Engine (UTC timezone), using local Date methods (getDate, getDay, etc.)
 * would return the previous day. These functions use SGT-aware extraction to ensure
 * correct date handling regardless of server timezone.
 */

const SGT_TIMEZONE = 'Asia/Singapore';

/**
 * Extract year, month (0-based), day, and dayOfWeek in SGT timezone.
 */
function getSGTDateParts(dateInput) {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;

    // Use Intl.DateTimeFormat to extract parts in SGT
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: SGT_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
    });

    const parts = formatter.formatToParts(d);
    const year = parseInt(parts.find(p => p.type === 'year').value, 10);
    const month = parseInt(parts.find(p => p.type === 'month').value, 10); // 1-based
    const day = parseInt(parts.find(p => p.type === 'day').value, 10);
    const weekday = parts.find(p => p.type === 'weekday').value; // "Sun", "Mon", etc.

    // Convert weekday string to number (0=Sunday, 6=Saturday)
    const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const dayOfWeek = dayMap[weekday];

    return { year, month, day, dayOfWeek };
}

/**
 * Convert a date to SGT midnight timestamp for comparison.
 * This gives us a consistent numeric value for the SGT calendar day.
 */
function toSGTDayTimestamp(dateInput) {
    const parts = getSGTDateParts(dateInput);
    if (!parts) return NaN;
    // Create a UTC timestamp representing the SGT calendar day (for comparison only)
    return Date.UTC(parts.year, parts.month - 1, parts.day);
}

/**
 * Check if two date ranges overlap (inclusive), using SGT dates.
 */
function rangesOverlap(aFrom, aTo, bFrom, bTo) {
    const a1 = toSGTDayTimestamp(aFrom);
    const a2 = toSGTDayTimestamp(aTo);
    const b1 = toSGTDayTimestamp(bFrom);
    const b2 = toSGTDayTimestamp(bTo);

    if (isNaN(a1) || isNaN(a2) || isNaN(b1) || isNaN(b2)) return false;
    return a1 <= b2 && b1 <= a2;
}

/**
 * Normalize a date to UTC day-start (avoids timezone false positives).
 */
function normalizeDayStartUTC(d) {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return NaN;
    return Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
}

/**
 * Check if a date is a weekend (Saturday or Sunday) in SGT timezone.
 */
function isWeekend(date) {
    const parts = getSGTDateParts(date);
    if (!parts) return false;
    return parts.dayOfWeek === 0 || parts.dayOfWeek === 6;
}

/**
 * Calculate business days between two dates (excluding weekends).
 * Does NOT exclude holidays — that should be handled separately.
 */
function countBusinessDays(fromDate, toDate) {
    let count = 0;
    // Work with SGT day timestamps for iteration
    let currentTs = toSGTDayTimestamp(fromDate);
    const endTs = toSGTDayTimestamp(toDate);

    if (isNaN(currentTs) || isNaN(endTs)) return 0;

    while (currentTs <= endTs) {
        // Create a temp date from the timestamp to check weekend
        const tempDate = new Date(currentTs);
        if (!isWeekend(tempDate)) {
            count++;
        }
        currentTs += 24 * 60 * 60 * 1000; // Add one day
    }
    return count;
}

/**
 * Check if two dates are the same calendar day in SGT timezone.
 */
function isSameDay(d1, d2) {
    const a = getSGTDateParts(d1);
    const b = getSGTDateParts(d2);
    if (!a || !b) return false;
    return (
        a.year === b.year &&
        a.month === b.month &&
        a.day === b.day
    );
}

/**
 * Format date as 'YYYY/MM/DD' in SGT timezone.
 */
function formatDateStr(dateInput) {
    const parts = getSGTDateParts(dateInput);
    if (!parts) return 'Invalid Date';
    const month = String(parts.month).padStart(2, '0');
    const day = String(parts.day).padStart(2, '0');
    return `${parts.year}/${month}/${day}`;
}

/**
 * Calculate actual working days excluding weekends, holidays, and accounting for half days.
 * All calculations use SGT timezone.
 * @param {Date} fromDate 
 * @param {Date} toDate 
 * @param {string} halftype - 'AM', 'PM', or undefined/empty
 * @param {Array} holidays - Array of holiday objects with {start, end} dates
 */
function calculateActualLeaveDays(fromDate, toDate, halftype, holidays = []) {
    let count = 0;

    // Use SGT day timestamps for iteration
    let currentTs = toSGTDayTimestamp(fromDate);
    const endTs = toSGTDayTimestamp(toDate);

    if (isNaN(currentTs) || isNaN(endTs)) return 0;

    // Half day check: if same day and half type specified
    if (halftype && (halftype === 'AM' || halftype === 'PM') && currentTs === endTs) {
        return 0.5;
    }

    // Pre-compute holiday timestamps in SGT for efficient comparison
    const holidayTimestamps = holidays.map(hol => toSGTDayTimestamp(hol.start)).filter(ts => !isNaN(ts));

    while (currentTs <= endTs) {
        const tempDate = new Date(currentTs);
        const isHol = holidayTimestamps.includes(currentTs);

        if (!isWeekend(tempDate) && !isHol) {
            count++;
        }
        currentTs += 24 * 60 * 60 * 1000; // Add one day
    }
    return count;
}

module.exports = {
    rangesOverlap,
    normalizeDayStartUTC,
    isWeekend,
    countBusinessDays,
    isSameDay,
    formatDateStr,
    calculateActualLeaveDays,
};
