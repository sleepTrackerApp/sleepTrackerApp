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

        res.redirect("/auth/logout")
        await sleepEntryService.deleteUser(userId);
        await weeklySummaryService.deleteUser(userId);
        await goalService.deleteUser(userId);
        await messageService.deleteUser(userId);
        await scheduleService.deleteUser(userId);
        await userService.deleteUser(userId);

        res.status(202).json({
            success: true,
            message: "User Account has been deleted"
        });
    } catch (error){
        next(error);
    }
}


module.exports = {   
    deleteAllUserData,
};
