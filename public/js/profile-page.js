document.addEventListener('DOMContentLoaded', function() {

    let currentPage = 1;
    let totalPages = 1;
    const entriesPerPage = 10;

    const messageHistoryLoad = async() => {
        const messageHistoryBody = document.getElementById("message-history"); 
        if(!messageHistoryBody) return; 

        const response = await fetch(
            `/api/?page=${currentPage}&limit=${entriesPerPage}`
        );
        const result = await response.json();




    }

    messageHistoryLoad()
});
