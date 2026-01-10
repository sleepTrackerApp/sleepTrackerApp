/**
 * Sleep Entries Controller
 *
 */

const { sleepEntriesService, userService } = require("../services")

async function getSleepEntries(req, res, next) {
    try {
        const userId = req.oidc.user.sub 

        const user = await userService.findUserByAuthId(userId)

        const limit = parseInt(req.query.limit) || 50;

        const entries = await sleepEntriesService.getAllSleepEntries(user);

        res.status(200).json({
            success: true,
            count: entries?.length ?? 0,
            data: entries,

        });
    } catch (error) {
        next(error)
    }
};

module.exports = {
    getSleepEntries,
};


