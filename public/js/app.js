$(document).ready(function(){
    $.get('/api/sleep-entries', function(data) {
        if(data.success){
            console.log("Sleep Entries:", data.data);
        } else {
            console.error("Failed to fetch sleep entries");
        }
    });
});