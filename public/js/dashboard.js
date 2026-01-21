document.addEventListener('DOMContentLoaded', function() {
    
    // Use the global socket from header or create if needed
    let socket = window.socket || io();
    window.socket = socket; // Store globally for other scripts
    
    console.log('[Dashboard] Using Socket.IO:', socket);
    console.log('[Dashboard] Socket connected?', socket.connected);
    
    // Listen for bedtime notifications
    socket.on('schedule:notification', function(notification) {
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
    
    socket.on('connect', function() {
        console.log('[Dashboard] Socket connected successfully, ID:', socket.id);
    });
    
    socket.on('disconnect', function() {
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
    
    // 1. Sleep Log: Toggle between Time and Duration
    const toggleButtons = document.querySelectorAll('.js-log-toggle');
    const viewDuration = document.getElementById('view-duration');
    const viewTime = document.getElementById('view-time');
    const previewWindow = document.getElementById('preview-window');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const selectedView = this.getAttribute('data-view');
            if (selectedView === 'time') {
                viewDuration.style.display = 'none';
                viewTime.style.display = 'block';
                // Update preview text if switching to Time
                previewWindow.innerHTML = '<p class="strong">10:00 PM - 06:30 AM</p>';
            } else {
                viewDuration.style.display = 'block';
                viewTime.style.display = 'none';
                // Reset preview window if using Duration mode
                previewWindow.innerHTML = '<p class="strong">-</p>';
            }
        });
    });

    // 2. Trend Toggle Logic
    const trendBtns = document.querySelectorAll('.js-trend-toggle');
    const weeklyContainer = document.getElementById('view-weekly');
    const monthlyContainer = document.getElementById('view-monthly');

    trendBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // UI: Update Active State
            trendBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Logic: Switch Visibility between Weekly/Monthly
            const view = this.getAttribute('data-view');
            if (view === 'monthly') {
                weeklyContainer.style.display = 'none';
                monthlyContainer.style.display = 'block';
            } else {
                weeklyContainer.style.display = 'block';
                monthlyContainer.style.display = 'none';
            }
        });
    });

    // 3. AI Insight Reveal: Permanent "View" without "Hide" logic
    const insightBtns = document.querySelectorAll('.js-view-insights');
    insightBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Find the insight box in the same column and show it permanently
            const contentBox = this.closest('.ai-insight-column').querySelector('.ai-content-box');
            contentBox.style.display = 'block';
            
            // Optionally hide the "View" link itself since it's no longer needed
            this.style.display = 'none';
        });
    });
});