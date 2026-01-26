/**
 * Delete User and all User data controller 
 */

const { sleepEntryService, 
    weeklySummaryService, 
    goalService, 
    messageService, 
    scheduleService,
    userService } = require("../services")

async function deleteAllUserData(req, res, next){
    try{
        const userId = res.locals.userRecord._id;

        await userService.deleteUser(userId);
        await sleepEntryService.deleteUser(userId);
        await weeklySummaryService.deleteUser(userId);
        await goalService.deleteUser(userId);
        await messageService.deleteUser(userId);
        await scheduleService.deleteUser(userId);
        res.sendStatus(204);

    } catch (error){
        next(error);
    }
}


module.exports = {   
    deleteAllUserData,
};
