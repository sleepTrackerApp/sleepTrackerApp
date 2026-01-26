/**
 * Service layer responsbile for with all models to delete user data 
 */

const services = require{"./index"}

async function deleteAllData(userId){
    for (const serviceName in services){
        const service = services[serviceName];
    }

    if(typeof service.deleteUser === "function"){
        await service.deleteUser(userId);
    }
} 

module.exports = { deleteAllData }
