document.addEventListener('DOMContentLoaded', function() {

    let currentPage = 1;
    let totalPages = 12;
    const entriesPerPage = 10;

    const messageHistoryLoad = async() => {
        const messageHistoryBody = document.getElementById("message-history"); 
        if(!messageHistoryBody) return; 

        const response = await fetch(
            `/api/messages/list?page=${currentPage}&pageSize=${totalPages}`
        );
        const result = await response.json();
        
        if (result.success){
            const { messages } = result || {};
            const message = messages || [];

            messageHistoryBody.innerHTML = message
                .map(msg => msg.content)
                .join('<br>');
        };
    }

    messageHistoryLoad()
});
