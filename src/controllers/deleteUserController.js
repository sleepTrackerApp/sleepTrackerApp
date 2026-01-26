/**
 * Sleep Entries Controller
 *
 */
const deleteUserData  = require("../services/deleteUserService")

async function deleteAllUserData (req, res, next){
    try{
        const user = res.locals.userRecord;
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
    deleteAllUserData
};
