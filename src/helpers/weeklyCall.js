/**
 * Weekly timer to call functions on each sunday
 *
 */

function nextWeek(){
    const now = new Date() 
    const tillSunday = (7 - now.getDay()) % 7;
    
    const nextSunday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + days
    );
    return nextSunday - now;

}

module.exports = {
    nextWeek,
};

