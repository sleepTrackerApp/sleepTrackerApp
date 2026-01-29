document.addEventListener('DOMContentLoaded', function() {
    
    // Initialise modal
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    let pendingDeleteData = null;

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
                .map(msg => {
                    const d = new Date(msg.updatedAt);
                    const month = d.toLocaleString("en-US", { month: "short" });
                    const day = d.getDate();
                    const year = d.getFullYear();

                    return `
                        <div class="message-pill" style="display: flex; align-items: center; gap: 15px;">
                            <label>
                                <input type="checkbox" class="msg-select" data-id="${msg._id}" />
                                <span></span>
                            </label>
                            <span class="message-date">
                                ${month} ${day}<span class="year">${year}</span>
                            </span>
                            <span class="message-pill-text">${msg.content.trim()}</span>
                        </div>
                        `;
                })
                .join('');

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

    // Handle "Select All on Page" checkbox
    document.getElementById('select-all-page')?.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.msg-select');
        checkboxes.forEach(cb => cb.checked = this.checked);
    });

    // Handle pop-up model for delete confirmation
    document.getElementById('btn-bulk-delete')?.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.msg-select:checked'))
                                 .map(cb => cb.getAttribute('data-id'));
        
        const startDate = document.getElementById('delete-start-date')?.value;
        const endDate = document.getElementById('delete-end-date')?.value;

        // Validation: Must select something
        if (selectedIds.length === 0 && (!startDate || !endDate)) {
            return M.toast({ html: 'Please select messages or a date range.', classes: 'orange' });
        }

        const btn = document.getElementById('btn-bulk-delete');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Checking...';
        btn.disabled = true;

        try {
            let finalStartDate = null;
            let finalEndDate = null;

            if (startDate && endDate) {
                const [sY, sM, sD] = startDate.split('-').map(Number);
                const [eY, eM, eD] = endDate.split('-').map(Number);

                const startObj = new Date(sY, sM - 1, sD, 0, 0, 0, 0);       // 00:00:00 Local
                const endObj = new Date(eY, eM - 1, eD + 1, 0, 0, 0, 0);    // 23:59:59 Local

                finalStartDate = startObj.toISOString();
                finalEndDate = endObj.toISOString();
            }

            const response = await fetch('/api/messages/bulk-delete-count', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ids: selectedIds, 
                    startDate: finalStartDate, 
                    endDate: finalEndDate 
                })
            });
            const data = await response.json();
            const count = data.count || 0;

            if (count === 0) {
                M.toast({ html: 'No messages found in this range.', classes: 'orange' });
                return; 
            }

            pendingDeleteData = { ids: selectedIds, finalStartDate, finalEndDate };

            const msgElement = document.getElementById('bulk-delete-msg');
            const word = count === 1 ? 'message' : 'messages';

            if (selectedIds.length > 0) {
                 msgElement.innerText = `Permanently delete ${count} selected ${word}?`;
            } else {
                 msgElement.innerText = `Permanently delete ${count} ${word} between ${startDate} and ${endDate}?`;
            }

            // Open the Confirmation Modal
            const instance = M.Modal.getInstance(document.getElementById('modal-bulk-delete'));
            instance.open();

        } catch (err) {
            console.error(err);
            M.toast({ html: 'Error checking messages.', classes: 'red' });
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Handle "Confirm" Button inside Modal to execute delete
    document.getElementById('btn-confirm-modal')?.addEventListener('click', async () => {
        if (!pendingDeleteData) return;

        try {
            const response = await fetch('/api/messages/bulk-delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ids: pendingDeleteData.ids, 
                    startDate: pendingDeleteData.finalStartDate || null, 
                    endDate: pendingDeleteData.finalEndDate || null 
                })
            });

            const data = await response.json();
            
            if (data.success) {
                M.toast({ html: `Deleted ${data.deletedCount || 0} messages`, classes: 'green' });
                
                // Reset UI
                const selectAllBox = document.getElementById('select-all-page');
                if(selectAllBox) selectAllBox.checked = false;
                
                // Refresh data and notification bell
                messageHistoryLoad();
                if (typeof window.refreshNotifications === 'function') {
                    window.refreshNotifications();
                }
            } else {
                throw new Error(data.error || 'Deletion failed');
            }
        } catch (err) {
            console.error('[Bulk Delete] Error:', err);
            M.toast({ html: 'Error deleting messages.', classes: 'red' });
        } finally {
            const instance = M.Modal.getInstance(document.getElementById('modal-bulk-delete'));
            instance.close();
            pendingDeleteData = null;
        }
    });

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
