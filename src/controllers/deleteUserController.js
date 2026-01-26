/**
 * Delete User and all User data controller 
 */
const { deleteUserData }= require("../services")

async function deleteAllUserData(req, res, next){
    try{
        const userId = res.locals.userRecord;

        const deleteAll = await deleteUserData.deleteAllData(userId);

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
