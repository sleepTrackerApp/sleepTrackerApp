/**
 * Helper functions for message logic.
 */

function buildBulkFilter(userId, ids, startDate, endDate) {
    const filter = { userId, messageType: 'text' };

    if (ids && ids.length > 0) {
        filter._id = { $in: ids };
    } else if (startDate && endDate) {
        filter.createdAt = { 
            $gte: new Date(startDate), 
            $lt: new Date(endDate) 
        };
    }
    return filter;
}

module.exports = {
    buildBulkFilter
};