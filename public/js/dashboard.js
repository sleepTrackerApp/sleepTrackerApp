document.addEventListener('DOMContentLoaded', function() {
    
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