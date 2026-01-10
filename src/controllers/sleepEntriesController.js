/**
 * Sleep Entries Controller
 *
 */
const { sleepEntriesService, userService } = require("../services")

async function getSleepEntries(req, res, next) {
  try {
<<<<<<< HEAD
    const user = res.locals.userRecords 
    
=======
    const userId = req.oidc.user.sub 
    
    const user = await userService.findUserByAuthId(userId)

>>>>>>> refs/remotes/origin/feature/US6-1-1-Fetch-a-list-of-sleep-entries
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


