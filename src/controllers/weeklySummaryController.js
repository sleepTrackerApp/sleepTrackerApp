/**
 * Controller layer responsbile for interacting with Sleep Entries model. 
 *
 */

const { weeklySummaryService, userService } = require("../services")

async function getWeeklySummary(req, res, next) {
    try {
        const userId = req.oidc.user.sub;
        const user = await userService.findUserByAuthId(userId)

        const getSummary = await weeklySummaryService.getAllWeeklySummary(user);

        res.status(200).json({
            success: true,
            data: getSummary
        });
    } catch (error) {
        next(error);
    }

};

async function createWeeklySummary(req, res, next) {
    try {
        const userId = req.oidc.user.sub;

        const summary = await weeklySummaryService.createWeeklySummary(userId);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWeeklySummary,
    createWeeklySummary,
};

