/**
 * Delete User and all User data controller 
 */
const { deleteUserService } = require("../services")

async function deleteAllUserData(req, res, next){
    try{
        const userId = res.locals.userRecord._id;

        const deleteAll = await deleteUserService.deleteAllData(userId);

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
