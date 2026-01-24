document.addEventListener('DOMContentLoaded', function () {

    // Use the global socket from header or create if needed
    let socket = window.socket || io();
    window.socket = socket; // Store globally for other scripts

    console.log('[Dashboard] Using Socket.IO:', socket);
    console.log('[Dashboard] Socket connected?', socket.connected);

    // Listen for bedtime notifications
    socket.on('schedule:notification', function (notification) {
        console.log('[Dashboard] Received notification:', notification);
        console.log('[Dashboard] Notification type:', notification.type);
        console.log('[Dashboard] Is bedtime?', notification.type === 'bedtime');

        if (notification.type === 'bedtime') {
            console.log('[Dashboard] Calling showBedtimeNotification...');
            showBedtimeNotification(notification);
        } else {
            console.log('[Dashboard] Notification type is not bedtime, skipping...');
        }
    });

    socket.on('connect', function () {
        console.log('[Dashboard] Socket connected successfully, ID:', socket.id);
    });

    socket.on('disconnect', function () {
        console.log('[Dashboard] Socket disconnected');
    });

    function showBedtimeNotification(notification) {
        console.log('[Notification] Creating notification element...');
        console.log('[Notification] Notification data:', notification);

        // Create notification element
        const notifDiv = document.createElement('div');
        notifDiv.className = 'bedtime-notification';
        notifDiv.innerHTML = `
            <div class="notif-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <small>${new Date(notification.timestamp).toLocaleTimeString()}</small>
            </div>
            <button class="notif-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Add CSS styles
        notifDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 400px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(450px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .bedtime-notification {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .notif-content {
                flex: 1;
            }
            .notif-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                margin-left: 15px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .notif-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notifDiv);
        console.log('[Notification] Notification added to DOM');

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notifDiv.parentElement) {
                notifDiv.remove();
            }
        }, 10000);

        // Browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/img/logo/icon.png',
            });
        }
    }

    // Sleep Data Entry
    //Toggle Logic
    const toggleButtons = document.querySelectorAll('.js-log-toggle');
    const viewDuration = document.getElementById('view-duration');
    const viewTime = document.getElementById('view-time');

    if (toggleButtons.length > 0 && viewDuration && viewTime) {
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                toggleButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                if (this.getAttribute('data-view') === 'time') {
                    viewDuration.style.display = 'none';
                    viewTime.style.display = 'block';
                } else {
                    viewDuration.style.display = 'block';
                    viewTime.style.display = 'none';
                }
            });
        });
    }

    //View Summary Logic
    const summaryBtn = document.getElementById('btn-view-summary');

    if (summaryBtn) {
        summaryBtn.addEventListener('click', () => {
            //Determine which tab is active
            const activeBtn = document.querySelector('.js-log-toggle.active');
            const viewType = activeBtn ? activeBtn.getAttribute('data-view') : 'duration';

            //Select preview elements by ID
            const totalPill = document.querySelector('.total-pill');
            const timeDisplay = document.getElementById('preview-time-window');
            const qualityDisplay = document.getElementById('preview-quality');
            const qualityVal = document.getElementById('sleep-rate').value;

            //Update Quality 
            if (qualityDisplay) {
                const status = qualityVal >= 7 ? 'Good' : (qualityVal >= 4 ? 'Fair' : 'Poor');
                qualityDisplay.innerText = `${qualityVal}/10 - ${status}`;
            }

            //pdate Sleep Data based on Tab
            if (viewType === 'duration') {
                const h = document.getElementById('input-hours').value;
                const m = document.getElementById('input-minutes').value;

                const hours = h ? parseInt(h) : 0;
                const mins = m ? parseInt(m) : 0;

                // VALIDATION: Duration cannot be 0
                if (hours === 0 && mins === 0) {
                    if (totalPill) totalPill.innerText = "-";
                    if (timeDisplay) timeDisplay.innerText = "-";
                    if (qualityDisplay) qualityDisplay.innerText = "-";

                    //Trigger the error message
                    M.toast({
                        html: 'Sleep duration cannot be 0 hours!',
                        classes: 'rounded red',
                        displayLength: 3000
                    });

                    return;
                }

                if (totalPill) {
                    totalPill.innerText = `${hours} hrs ${mins.toString().padStart(2, '0')} mins`;
                }
                if (timeDisplay) timeDisplay.innerText = '-';
            }
            else {
                const startTime = document.querySelector('#view-time input:nth-of-type(1)').value;
                const endTime = document.querySelector('#view-time input:nth-of-type(2)').value;

                const start = new Date(`2026-01-01T${startTime}`);
                const end = new Date(`2026-01-01T${endTime}`);
                let diff = (end - start) / 1000 / 60 / 60;
                if (diff < 0) diff += 24;

                const h = Math.floor(diff);
                const m = Math.round((diff - h) * 60);

                if (totalPill) totalPill.innerText = `${h} hrs ${m.toString().padStart(2, '0')} mins`;

                // Format 24h to 12h
                const format12h = (t) => {
                    const [hr, min] = t.split(':');
                    const hInt = parseInt(hr);
                    return `${((hInt + 11) % 12 + 1)}:${min} ${hInt >= 12 ? 'PM' : 'AM'}`;
                };
                if (timeDisplay) timeDisplay.innerText = `${format12h(startTime)} - ${format12h(endTime)}`;
            }
        });
    }

    //Confirm and Save Logic
    const confirmBtn = document.querySelector('.preview-card .main-action-btn');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const displayArea = document.getElementById('saved-sleep-display');
            const textElement = document.getElementById('final-log-text');
            const totalPillValue = document.querySelector('.total-pill').innerText;

            const dateInput = document.getElementById('sleep-date');
            let displayDate = "Last Night";

            if (dateInput && dateInput.value) {
                const dateObj = new Date(dateInput.value);
                displayDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }

            //Display the success message
            if (displayArea && textElement) {
                const totalPillValue = document.querySelector('.total-pill').innerText;

                if (totalPillValue === "-" || totalPillValue.startsWith("0 hrs 00")) {
                    M.toast({
                        html: 'Please "View Summary" to calculate sleep before saving!',
                        classes: 'rounded orange'
                    });
                    return;
                }

                displayArea.style.display = 'block';

                // Show the dynamic date and total sleep duration
                textElement.innerHTML = `<strong>Success:</strong> Sleep data logged for the night of ${displayDate}. Total duration: ${totalPillValue}.`;

                displayArea.classList.add('pulse');
                setTimeout(() => displayArea.classList.remove('pulse'), 2000);

                // 4. Reset Preview UI
                document.querySelector('.total-pill').innerText = "-";
                const timeWindow = document.getElementById('preview-time-window');
                const qualityLabel = document.getElementById('preview-quality');
                if (timeWindow) timeWindow.innerText = "-";
                if (qualityLabel) qualityLabel.innerText = "-";

                displayArea.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    //Date Picker's default date
    const dateInput = document.getElementById('sleep-date');
    if (dateInput) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        // Format to YYYY-MM-DD for the input value
        dateInput.value = yesterday.toISOString().split('T')[0];
    }
});