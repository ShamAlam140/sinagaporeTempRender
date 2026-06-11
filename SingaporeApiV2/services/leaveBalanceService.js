/**
 * Leave Balance Service — Internal module for managing leave type balances.
 * Handles deduction, restoration, and type-swap operations.
 * All operations work directly on the employee document (not separate API calls).
 */

/**
 * Find leave type index in employee.leaveType array.
 */
function findLeaveTypeIndex(leaveTypeArr, typeName) {
    if (!Array.isArray(leaveTypeArr)) return -1;
    return leaveTypeArr.findIndex(
        (lt) => String(lt.type).toLowerCase() === String(typeName).toLowerCase()
    );
}

/**
 * Ensure numeric fields on a leave type entry.
 */
function ensureNumericFields(leaveTypeEntry) {
    if (typeof leaveTypeEntry.remaining !== 'number') leaveTypeEntry.remaining = 0;
    if (typeof leaveTypeEntry.used !== 'number') leaveTypeEntry.used = 0;
    if (typeof leaveTypeEntry.count !== 'number') leaveTypeEntry.count = 0;
    if (typeof leaveTypeEntry.issued !== 'number') leaveTypeEntry.issued = 0;
    if (typeof leaveTypeEntry.carried !== 'number') leaveTypeEntry.carried = 0;
}

/**
 * Deduct leave balance when a leave is approved.
 * Modifies the employee document in-memory (must be saved by caller).
 *
 * @param {Object} employee - The employee Mongoose document
 * @param {string} leaveType - The leave type name (e.g., "Annual")
 * @param {number} days - Number of days to deduct
 * @returns {{ success: boolean, error?: string }}
 */
function deductLeaveBalance(employee, leaveType, days) {
    const currentYear = new Date().getFullYear();
    const idx = employee.leaveType.findIndex(
        (lt) =>
            String(lt.type).toLowerCase() === String(leaveType).toLowerCase() &&
            lt.year === currentYear
    );

    if (idx === -1) {
        console.log(`⚠️ Leave type "${leaveType}" for year ${currentYear} not found`);
        return { success: false, error: `Leave type "${leaveType}" not found for current year` };
    }

    ensureNumericFields(employee.leaveType[idx]);

    if (employee.leaveType[idx].remaining < days) {
        console.log(`⚠️ Insufficient ${leaveType} balance. Need: ${days}, Have: ${employee.leaveType[idx].remaining}`);
        return {
            success: false,
            error: `Insufficient ${leaveType} leave balance. Required: ${days}, Available: ${employee.leaveType[idx].remaining}`,
        };
    }

    employee.leaveType[idx].remaining -= days;
    employee.leaveType[idx].used = (employee.leaveType[idx].used || 0) + days;
    employee.markModified('leaveType');

    console.log(`✅ Deducted ${days} days from ${leaveType}. Remaining: ${employee.leaveType[idx].remaining}`);
    return { success: true };
}

/**
 * Restore leave balance when a leave is cancelled/denied after approval.
 * Modifies the employee document in-memory (must be saved by caller).
 */
function restoreLeaveBalance(employee, leaveType, days) {
    const currentYear = new Date().getFullYear();
    const idx = employee.leaveType.findIndex(
        (lt) =>
            String(lt.type).toLowerCase() === String(leaveType).toLowerCase() &&
            lt.year === currentYear
    );

    if (idx === -1) {
        console.log(`⚠️ Leave type "${leaveType}" for year ${currentYear} not found for restoration`);
        return { success: false, error: `Leave type "${leaveType}" not found for current year` };
    }

    ensureNumericFields(employee.leaveType[idx]);

    employee.leaveType[idx].remaining += days;
    employee.leaveType[idx].used = Math.max(0, employee.leaveType[idx].used - days);
    employee.markModified('leaveType');

    console.log(`✅ Restored ${days} days to ${leaveType} (${currentYear}). Remaining: ${employee.leaveType[idx].remaining}`);
    return { success: true };
}

/**
 * Swap leave type (for type-change on approved leaves).
 * Restores old type balance and deducts new type balance.
 */
function swapLeaveType(employee, oldType, newType, days) {
    const oldIdx = findLeaveTypeIndex(employee.leaveType || [], oldType);
    const newIdx = findLeaveTypeIndex(employee.leaveType || [], newType);

    if (oldIdx === -1) return { success: false, error: `Original leave type "${oldType}" not found` };
    if (newIdx === -1) return { success: false, error: `New leave type "${newType}" not found` };

    ensureNumericFields(employee.leaveType[oldIdx]);
    ensureNumericFields(employee.leaveType[newIdx]);

    if (employee.leaveType[newIdx].remaining < days) {
        return {
            success: false,
            error: `Insufficient ${newType} balance. Required: ${days}, Available: ${employee.leaveType[newIdx].remaining}`,
        };
    }

    // Restore old
    employee.leaveType[oldIdx].remaining += days;
    employee.leaveType[oldIdx].used = Math.max(0, employee.leaveType[oldIdx].used - days);

    // Deduct new
    employee.leaveType[newIdx].remaining -= days;
    employee.leaveType[newIdx].used += days;

    employee.markModified('leaveType');
    console.log(`✅ Swapped ${days} days from ${oldType} → ${newType}`);
    return { success: true };
}

module.exports = {
    findLeaveTypeIndex,
    ensureNumericFields,
    deductLeaveBalance,
    restoreLeaveBalance,
    swapLeaveType,
};
