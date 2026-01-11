/**
 * Controller layer responsbile for interacting with Sleep Entries model.
 *
 */

const { weeklySummaryService } = require("../services")

async function getWeeklySummary(req, res, next) {
    try {
        const user = res.locals.userRecord;

        const getSummary = await weeklySummaryService.getAllWeeklySummary(user);

        res.status(200).json({
            success: true,
            data: getSummary
        });
    } catch (error) {
        next(error);
    }
}

async function createWeeklySummary(req, res, next) {
    try {
        const user = res.locals.userRecord;

        const summary = await weeklySummaryService.createWeeklySummary(user);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getWeeklySummary,
    createWeeklySummary,
};