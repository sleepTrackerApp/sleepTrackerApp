document.addEventListener('DOMContentLoaded', function() {
    
    // Load all announcements for user
    let currentPage = 1;
    let totalPages = 1;
    const entriesPerPage = 10;

    const messageHistoryLoad = async() => {
        const messageHistoryBody = document.getElementById("message-history"); 
        if(!messageHistoryBody) return; 

        const response = await fetch(
            `/api/messages/list?page=${currentPage}&pageSize=${entriesPerPage}`
        );
        const result = await response.json();
        
        if (result.success){
            const { messages, total } = result || {};
            totalPages = Math.ceil((total || 0) / entriesPerPage);
            const message = messages || [];
            
            messageHistoryBody.innerHTML = message
                .map(msg => `
                    <div class="message-pill">
                        ${msg.content.trim()}
                    </div>
                    `)
                .join('<br>');
        };

        const pageInfoEl = document.getElementById('page-info');
        if (pageInfoEl) {
            pageInfoEl.innerText = `Page ${currentPage} of ${totalPages}`;
        }

        const prevBtn = document.getElementById('prev-page');
        if (prevBtn) {
            prevBtn.disabled = currentPage <= 1;
        }

        const nextBtn = document.getElementById('next-page');
        if (nextBtn) {
            nextBtn.disabled = totalPages <= 0 || currentPage >= totalPages;
        }

    }

    document.getElementById('prev-page')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            messageHistoryLoad()
        }
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            messageHistoryLoad()
        }
    });

    messageHistoryLoad()

});
