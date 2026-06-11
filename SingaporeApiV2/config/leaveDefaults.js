/**
 * Default leave types assigned to new employees.
 * Modify this file to change leave allotments — no controller changes needed.
 */

const getDefaultLeaveTypes = (generateIdFn) => {
    const year = new Date().getFullYear();

    return [
        {
            type: 'Annual',
            count: 16,
            year,
            remaining: 16,
            carried: 0,
            issued: 16,
            used: 0,
            tid: generateIdFn(5),
        },
        {
            type: 'Sick/Casual',
            count: 15,
            year,
            remaining: 15,
            carried: 0,
            issued: 15,
            used: 0,
            tid: generateIdFn(5),
        },
        {
            type: 'RH',
            count: 2,
            year,
            remaining: 2,
            carried: 0,
            issued: 2,
            used: 0,
            tid: generateIdFn(5),
        },
        {
            type: 'Hospitalization',
            count: 10,
            year,
            remaining: 10,
            carried: 0,
            issued: 10,
            used: 0,
            tid: generateIdFn(5),
        },
    ];
};

module.exports = { getDefaultLeaveTypes };
