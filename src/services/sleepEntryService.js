/**
 * Service layer responsbile for interacting with Sleep Entries model.
 */
const { SleepEntry } = require("../models")

/**
 * Parse a date string and normalize to midnight.
 * @param dateString - date string to parse
 * @param normalize - whether to normalize to midnight (default: true)
 * @returns {Date} - parsed Date object
 * @throws {Error} - if dateString is invalid
 */
function parseDate(dateString, normalize=false) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }
    if (normalize) {
        date.setHours(0, 0, 0, 0);
    }
    return date;
}

/**
 * Prepares and validates sleep entry data.
 * @param entryData - raw entry data. Expected fields are:
 * - entryTime {string} - the date for the sleep entry
 * - startTime {string} - the date-time when sleep started
 * - endTime {string} - the date-time when sleep ended
 * - duration {int} - total minutes slept (0-1440)
 * - rating {int} - sleep quality rating (0-10)
 * Other fields are ignored.
 * @returns {Object} - prepared and validated entry data
 * @throws {Error} - if validation fails
 */
function prepareSleepEntryData(entryData) {
    const { entryTime, startTime, endTime, duration, rating } = entryData;

    // Validate entryTime is provided
    if (!entryTime) {
        throw new Error('Entry date is required');
    }

    // Validate entryTime and normalize to midnight
    let entryDate = null;
    try {
        entryDate = parseDate(entryTime, true);
    } catch (err) {
        throw new Error('Entry date must be a valid');
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
        if (typeof rating !== 'number' || rating < 0 || rating > 10) {
            throw new Error('Rating must be a number between 0 and 10');
        }
    }

    // Check that either duration or both startTime and endTime are supplied
    const hasDuration = duration !== undefined && duration !== null;
    const hasStartTime = startTime !== undefined && startTime !== null;
    const hasEndTime = endTime !== undefined && endTime !== null;

    // Validate that we have either duration OR both startTime and endTime
    if (!hasDuration && (!hasStartTime || !hasEndTime)) {
        throw new Error('Either sleep duration or both start and end time must be provided');
    }

    // If only one of startTime or endTime is provided, refuse
    if ((hasStartTime && !hasEndTime) || (!hasStartTime && hasEndTime)) {
        throw new Error('Both start and end time must be provided');
    }

    let calculatedDuration = duration;
    let finalStartTime = null;
    let finalEndTime = null;

    // If both startTime and endTime are provided, use them to calculate duration
    if (hasStartTime && hasEndTime) {
        // Convert date values to Date objects
        let startDate = null;
        try {
            startDate = parseDate(startTime);
        } catch (err) {
            throw new Error('Start time must be a valid date');
        }
        let endDate = null;
        try {
            endDate = parseDate(endTime);
        } catch (err) {
            throw new Error('Snd time must be a valid date');
        }

        // Verify the entryDate matches the date portion of startTime
        if (startDate.getFullYear() !== entryDate.getFullYear() ||
            startDate.getMonth() !== entryDate.getMonth() ||
            startDate.getDate() !== entryDate.getDate()) {
            throw new Error('Start date must match entry date');
        }

        // Verify startDate < endDate
        if (startDate >= endDate) {
            throw new Error('Start time must be earlier than end time');
        }

        // Verify endTime is not more than 24 hours after startTime
        const maxEndTime = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        if (endDate > maxEndTime) {
            throw new Error('End time cannot be more than 24 hours after start time');
        }

        // Calculate duration in minutes
        const diffMs = endDate.getTime() - startDate.getTime();
        calculatedDuration = Math.round(diffMs / (1000 * 60));

        // Store the Date objects
        finalStartTime = startDate;
        finalEndTime = endDate;
    }

    // Validate calculated duration
    if (calculatedDuration > 1440) {
        throw new Error('Sleep duration cannot exceed 24 hours');
    }

    // Check for if sleep duration is negative
    if (calculatedDuration < 0) {
        throw new Error('Sleep duration cannot be negative');
    }

    // Check if sleep duration is provided or calculated
    if (calculatedDuration === 0) {
        throw new Error('Please provide a valid sleep duration or start and end time');
    }

    // Build and return the prepared entry data
    const preparedData = {
        entryDate,  // Use entryDate (Date object) not entryTime (string)
        duration: calculatedDuration,
        rating: rating !== undefined && rating !== null ? rating : null
    };

    // Only include startTime and endTime if they were provided (as Date objects)
    if (finalStartTime && finalEndTime) {
        preparedData.startTime = finalStartTime;
        preparedData.endTime = finalEndTime;
    }

    return preparedData;
}

/**
 * Fetch sleep entries for a user with pagination.
 * @param userId - ID of the user object
 * @param page - page number for pagination
 * @param limit - number of entries per page
 * @param startDate - optional start date for filtering (inclusive)
 * @param endDate - optional end date for filtering (inclusive)
 * @returns {Promise<Object>} - object containing sleep entries and pagination info
 */
async function getSleepEntries(userId, page, limit, startDate = null, endDate = null) {
    const skip = (page - 1) * limit;
    
    // Build query with optional date range filtering
    const query = { userId };
    
    if (startDate || endDate) {
        query.entryDate = {};
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            query.entryDate.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.entryDate.$lte = end;
        }
    }
    
    const result = await SleepEntry.find(query)
        .sort({ entryDate: -1})
        .skip(skip)
        .limit(limit);

    const totalEntries = await SleepEntry.countDocuments(query);
    const totalPages = Math.ceil(totalEntries / limit);

    return {
        sleepEntries: result,
        totalEntries,
        totalPages,
        currentPage: page
    }
}

/**
 * Get a sleep entry by date for a user.
 * @param userId - ID of the user object
 * @param entryDate - date of the sleep entry
 * @returns {Promise<import('mongoose').Document|null>} - sleep entry object if found
 */
async function getSleepEntryByDate(userId, entryDate) {
    const normalizedDate = parseDate(entryDate, true);
    return SleepEntry.findOne({ userId, entryDate: normalizedDate });
}

/**
 * Get or create a sleep entry for a user by date.
 * @param {string} userId - ID of the user object
 * @param {Date} entryData - data for the sleep entry if creating new
 * @returns {Promise<import('mongoose').Document>} - existing or newly created sleep entry object
 * @throws {Error} - if validation fails
 */
async function getOrCreateSleepEntry(userId, entryData) {
    // Prepare and validate the entry data
    const preparedData = prepareSleepEntryData(entryData);
    
    // Extract the normalized entry date and keep the rest in setData
    const { entryDate, ...setData } = preparedData;

    // Find existing or create new sleep entry and return it
    return SleepEntry.findOneAndUpdate(
        { userId, entryDate: entryDate },
        {
            $setOnInsert: { userId, entryDate: entryDate },
            $set: setData
        },
        { new: true, upsert: true }
    );
}

/**
 * Delete a sleep entry by date for a user.
 * @param userId - ID of the user object
 * @param entryDate - date of the sleep entry
 * @returns {Promise<import('mongoose').Document|null>} - deleted sleep entry object if found
 */
async function deleteSleepEntryByDate(userId, entryDate) {
    const normalizedDate = parseDate(entryDate, true);
    return SleepEntry.findOneAndDelete({ userId, entryDate: normalizedDate });
}

module.exports = {
    getSleepEntries,
    getSleepEntryByDate,
    getOrCreateSleepEntry,
    deleteSleepEntryByDate,
};


