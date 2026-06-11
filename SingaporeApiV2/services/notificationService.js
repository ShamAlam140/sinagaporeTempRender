/**
 * Notification Service — Internal module for adding in-app notifications.
 * Uses the employee document's notification[] array.
 * All operations participate in MongoDB sessions for transaction support.
 */
const Employee = require('../models/Employee');
const { generateId } = require('../utils/idGenerator');
const { formatDateStr } = require('../utils/dateUtils');

/**
 * Add a notification to an employee's notification array.
 * Works within a transaction session if provided.
 */
async function addNotification(employeeId, title, description, session = null) {
    try {
        const nid = generateId(5);
        const notification = { nid, leaveTitle: title, leaveDescription: description };

        const updateOptions = session ? { session } : {};
        const employee = await Employee.findById(employeeId).session(session);
        if (!employee) {
            console.log(`⚠️ Employee ${employeeId} not found for notification`);
            return;
        }

        employee.notification.push(notification);
        await employee.save(updateOptions);
        console.log(`✅ Notification added to ${employeeId}: ${title}`);
    } catch (error) {
        console.error(`❌ Failed to add notification to ${employeeId}:`, error.message);
    }
}

/**
 * Add "Your leave is approved" notification to the employee.
 */
async function addApprovalNotification(employeeId, leave, session = null) {
    const t1 = formatDateStr(leave.fromDate);
    const t2 = formatDateStr(leave.toDate);
    const title = `Your ${leave.type} Leave of ${leave.count} Days is Approved`;
    const description = `Duration: ${t1} to ${t2}`;
    return addNotification(employeeId, title, description, session);
}

/**
 * Add "Your leave is denied" notification to the employee.
 */
async function addDenialNotification(employeeId, leave, session = null) {
    const t1 = formatDateStr(leave.fromDate);
    const t2 = formatDateStr(leave.toDate);
    const title = `Your ${leave.type} Leave of ${leave.count} Days is Denied!`;
    const description = `${t1} to ${t2}`;
    return addNotification(employeeId, title, description, session);
}

/**
 * Add "You have to cover X days" notification to covering officers.
 */
async function addCoveringOfficerNotifications(employee, leave, session = null) {
    try {
        if (!employee.coveringEmployees || employee.coveringEmployees.length === 0) {
            return;
        }

        const t1 = formatDateStr(leave.fromDate);
        const t2 = formatDateStr(leave.toDate);

        for (const coveringEmp of employee.coveringEmployees) {
            if (!coveringEmp || !coveringEmp._id) continue;

            const title = `You have to cover ${leave.count} Days for your Cover Employee ${employee.empName}`;
            const description = `Duration: ${t1} to ${t2}`;
            await addNotification(coveringEmp._id, title, description, session);
        }
    } catch (error) {
        console.error('❌ Failed to add covering officer notifications:', error.message);
    }
}

/**
 * Add "global holiday" notification to all employees
 */
async function notifyAllEmployees(title, description) {
    try {
        const employees = await Employee.find({}, '_id');
        for (const emp of employees) {
            await addNotification(emp._id, title, description);
        }
        console.log(`✅ Notified ${employees.length} employees about ${title}`);
    } catch (error) {
        console.error('❌ Failed to notify all employees', error.message);
    }
}

module.exports = {
    addNotification,
    addApprovalNotification,
    addDenialNotification,
    addCoveringOfficerNotifications,
    notifyAllEmployees,
};
