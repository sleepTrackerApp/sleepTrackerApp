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
    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', function () {
        toggleButtons.forEach((b) => b.classList.remove('active'));
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

  // Confirm and Save Logic
  let currentPage = 1;
  const entriesPerPage = 10;

  const loadPersistentHistory = async () => {
    const historyBody = document.getElementById('sleep-history-body');
    if (!historyBody) return;

    // Fetch from Controller's getSleepEntries endpoint
    const response = await fetch(
      `/api/sleep-entries?page=${currentPage}&limit=${entriesPerPage}`
    );
    const result = await response.json();

    if (result.success) {
      const { sleepEntries, totalPages } = result.data;

      historyBody.innerHTML = sleepEntries
        .map((entry) => {
          const date = new Date(entry.entryDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const hrs = Math.floor(entry.duration / 60);
          const mins = entry.duration % 60;

          return `<tr>
                <td>${date}</td>
                <td>${hrs} hrs ${mins.toString().padStart(2, '0')} mins</td>
                <td>${entry.rating}/10</td>
            </tr>`;
        })
        .join('');

      document.getElementById('page-info').innerText =
        `Page ${currentPage} of ${totalPages || 1}`;
      document.getElementById('next-page').disabled = currentPage >= totalPages;

      const prevBtn = document.getElementById('prev-page');
      if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
      }

      const nextBtn = document.getElementById('next-page');
      if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
      }
    }
  };

  // Add Event Listeners for Buttons
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadPersistentHistory();
    }
  });

  document.getElementById('next-page')?.addEventListener('click', () => {
    const savedData = JSON.parse(localStorage.getItem('sleepHistory')) || [];
    if (currentPage * entriesPerPage < savedData.length) {
      currentPage++;
      loadPersistentHistory();
    }
  });

  loadPersistentHistory();

  const confirmBtn = document.getElementById('btn-confirm-save');

  confirmBtn.addEventListener('click', async () => {
    const activeBtn = document.querySelector('.js-log-toggle.active');
    const viewType = activeBtn
      ? activeBtn.getAttribute('data-view')
      : 'duration';
    const entryTime = document.getElementById('sleep-date').value;

    const entryData = {
      entryTime: entryTime,
      rating: parseInt(document.getElementById('sleep-rate').value),
    };

    if (viewType === 'duration') {
      const h = parseInt(document.getElementById('input-hours').value) || 0;
      const m = parseInt(document.getElementById('input-minutes').value) || 0;
      entryData.duration = h * 60 + m;
    } else {
      const startVal = document.querySelector(
        '#view-time input:nth-of-type(1)'
      ).value;
      const endVal = document.querySelector(
        '#view-time input:nth-of-type(2)'
      ).value;

      // Create Date objects using the entry date as the base
      let startDate = new Date(`${entryTime}T${startVal}`);
      let endDate = new Date(`${entryTime}T${endVal}`);

      // If the start time is in AM, the date is the next
      if (startDate.getHours() < 12) {
        startDate.setDate(startDate.getDate() + 1);
      }

      if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      entryData.startTime = startDate.toISOString();
      entryData.endTime = endDate.toISOString();
    }

    try {
      const response = await fetch('/api/sleep-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });

      const result = await response.json();

      if (result.success) {
        M.toast({ html: 'Sleep data saved to database!', classes: 'green' });
        currentPage = 1;
        loadPersistentHistory();
        updateSleepChart();
      } else {
        M.toast({ html: result.error.message, classes: 'red' });
      }
    } catch (err) {
      M.toast({ html: 'Server connection error', classes: 'red' });
    }
  });

  //Date Picker's default date
  const dateInput = document.getElementById('sleep-date');
  if (dateInput) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Format to YYYY-MM-DD for the input value
    dateInput.value = yesterday.toISOString().split('T')[0];
  }

  function addToHistory(date, duration, quality) {
    const historyBody = document.getElementById('sleep-history-body');
    if (!historyBody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${date}</td>
        <td>${duration}</td>
        <td>${quality}</td>
    `;

    // Add new entry to the top
    historyBody.insertBefore(row, historyBody.firstChild);

    if (historyBody.rows.length > 10) {
      historyBody.deleteRow(10);
    }
  }

  const trendToggles = document.querySelectorAll('.js-trend-toggle');
  let currentTrendView = 'weekly';

  // Toggle between weekly and monthly view of the charts
  trendToggles.forEach((btn) => {
    btn.addEventListener('click', function () {
      trendToggles.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      currentTrendView = this.getAttribute('data-view');
      updateSleepChart();
    });
  });

  // Global variable to hold the chart instance
  window.sleepChart = null;

  const initChart = () => {
    const ctx = document.getElementById('sleepChart').getContext('2d');
    window.sleepChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Hours Slept',
            data: [],
            borderColor: '#1b3f88',
            backgroundColor: 'rgba(51, 142, 240, 0.2)',
            borderWidth: 1.5,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 35,
            top: 10,
            left: 10,
            right: 10,
          },
        },
        animation: {
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 5;
            }
            return delay;
          },
        },
        scales: {
          y: {
            beginAtZero: true,

            title: { display: true, text: 'Hours' },
          },
        },
        plugins: {
          annotation: {
            annotations: {
              goalLine: {
                type: 'line',
                yMin: 8,
                yMax: 8,
                borderColor: '#22ff29',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: 'Goal',
                  position: 'end',
                  backgroundColor: '#22ff29',
                  font: { size: 10 },
                },
              },
            },
          },
        },
      },
    });
  };

  initChart();
  updateSleepChart();

  async function updateSleepChart() {
    let chartLabels = [];
    let chartDurations = [];
    let userGoal = 8;
    let chartTitle = 'Hours Slept';

    //Fetching Goal and displaying on the graph
    const goalResponse = await fetch('/api/goal');
    const goalResult = await goalResponse.json();
    if (goalResult.success && goalResult.data) {
      userGoal = (goalResult.data.goalValue / 60).toFixed(1);
    }

    //Weekly View
    if (currentTrendView === 'weekly') {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      monday.setDate(now.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        chartLabels.push(
          d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' })
        );
        weekDates.push(d.toISOString().split('T')[0]);
      }

      const response = await fetch(
        `/api/sleep-entries?startDate=${monday.toISOString()}`
      );
      const result = await response.json();
      chartDurations = new Array(7).fill(0);

      if (result.success && result.data.sleepEntries) {
        result.data.sleepEntries.forEach((entry) => {
          const entryDateStr = new Date(entry.entryDate)
            .toISOString()
            .split('T')[0];
          const index = weekDates.indexOf(entryDateStr);
          if (index !== -1) {
            chartDurations[index] = (entry.duration / 60).toFixed(1);
          }
        });
      }
    } else {
      //Monthly View
      chartTitle = 'Avg Hours/Month';
      const now = new Date();
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 11);
      twelveMonthsAgo.setDate(1);

      const response = await fetch(
        `/api/sleep-entries?startDate=${twelveMonthsAgo.toISOString()}&limit=1000`
      );
      const result = await response.json();

      if (result.success && result.data.sleepEntries) {
        const entries = result.data.sleepEntries;
        for (let i = 0; i < 12; i++) {
          const targetMonth = new Date(twelveMonthsAgo);
          targetMonth.setMonth(twelveMonthsAgo.getMonth() + i);
          chartLabels.push(
            targetMonth.toLocaleDateString('en-AU', {
              month: 'short',
              year: '2-digit',
            })
          );

          const monthEntries = entries.filter((e) => {
            const d = new Date(e.entryDate);
            return (
              d.getMonth() === targetMonth.getMonth() &&
              d.getFullYear() === targetMonth.getFullYear()
            );
          });

          if (monthEntries.length > 0) {
            const totalHrs = monthEntries.reduce(
              (sum, e) => sum + e.duration / 60,
              0
            );
            chartDurations.push((totalHrs / monthEntries.length).toFixed(1));
          } else {
            chartDurations.push(0);
          }
        }
      }
    }

    if (window.sleepChart) {
      const annotations =
        window.sleepChart.options.plugins.annotation.annotations;
      if (annotations.goalLine) {
        annotations.goalLine.yMin = userGoal;
        annotations.goalLine.yMax = userGoal;
        annotations.goalLine.label.content = `Goal: ${userGoal}h`;
      }

      window.sleepChart.data.labels = chartLabels;
      window.sleepChart.data.datasets[0].data = chartDurations;
      window.sleepChart.data.datasets[0].label = chartTitle;

      window.sleepChart.update();
      updateSummaryStats(chartLabels, chartDurations, userGoal, currentTrendView);


    }
  }

  function updateSummaryStats(labels, durations, userGoal, viewType) {
    // Filter out entries with 0 duration
    const activeEntries = durations
      .map((val, index) => ({ value: Number(val), label: labels[index] }))
      .filter(entry => entry.value > 0);

    const totalCount = activeEntries.length;
    if (totalCount === 0) return;

    // Calculating sleep duration
    const totalDuration = activeEntries.reduce((sum, e) => sum + e.value, 0);
    const avg = totalDuration / totalCount;

    const sorted = [...activeEntries].sort((a, b) => a.value - b.value);
    const shortest = sorted[0];
    const longest = sorted[sorted.length - 1];

    const formatTime = (val) => {
      const h = Math.floor(val);
      const m = Math.round((val - h) * 60);
      return `${h}h ${m}m`;
    };

    // Update UI
    const unitSpan = document.getElementById('unit-text');
    const labelPrefix = viewType === 'weekly' ? '' : 'Avg: ';

    if (unitSpan) {
      if (viewType === 'weekly') {
        unitSpan.innerText = 'days';
      } else {
        unitSpan.innerText = 'months';
      }
    }

    // Update Header and stats
    const titleElement = document.querySelector('.trend-details p.strong');
    if (titleElement) {
      titleElement.innerText = viewType === 'weekly' ? 'Weekly Summary' : 'Monthly Summary';
    }

    const goalStatus = avg >= userGoal ? "(Goal Met)" : "(Just under goal)";

    document.getElementById('avg-duration').innerText = `${formatTime(avg)} ${goalStatus}`;
    document.getElementById('goal-met').innerText = activeEntries.filter(e => e.value >= userGoal).length;
    document.getElementById('total-units').innerText = totalCount;

    // Update Longest and Shortest Sleep Duration
    document.getElementById('longest-sleep').innerText = `${longest.label} (${labelPrefix}${formatTime(longest.value)})`;
    document.getElementById('shortest-sleep').innerText = `${shortest.label} (${labelPrefix}${formatTime(shortest.value)})`;
  }

  // View AI Insights
  const viewInsightBtn = document.querySelector('.js-view-insights');
  const aiContentBox = document.querySelector('.ai-content-box');

  if (viewInsightBtn && aiContentBox) {
    viewInsightBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      viewInsightBtn.innerText = 'Analyzing...';

      try {
        // Route: /api/insights
        const response = await fetch('/api/insights');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Scientist is busy.');

        aiContentBox.innerHTML = `
                    <ul class="summary-list" style="margin-top: 20px; border-left: 4px solid #26a69a; padding-left: 15px;">
                        <li><strong>Score:</strong> ${data.insight.score}/100</li>
                        <li><strong>Insight:</strong> ${data.insight.insight}</li>
                        <li><strong>Analysis:</strong> ${data.insight.analysis}</li>
                        <li><strong>Recommendation:</strong> ${data.insight.recommendation}</li>
                    </ul>
                `;
        aiContentBox.style.display = 'block';
        viewInsightBtn.style.display = 'none';
      } catch (err) {
        console.error('Insight Fetch Error:', err);
        M.toast({
          html: 'Scientist is busy. Try logging more sleep!',
          classes: 'red',
        });
        viewInsightBtn.innerText = 'View';
      }
    });
  }

  // Sleep Goal
  // Targets the "Save" button in Goal section
  const saveGoalBtn = document.querySelector(
    '#goal-setup-form .main-action-btn'
  );
  if (saveGoalBtn) {
    saveGoalBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const hours = document.getElementById('goal-hours')?.value || 8;

      try {
        const response = await fetch('/api/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: parseInt(hours) * 60 }),
        });

        if (response.ok) {
          M.toast({ html: 'Goal synced with Scientist!', classes: 'green' });
          updateSleepChart();
        }
      } catch (err) {
        console.error('Goal Sync Error:', err);
      }
    });
  }
});
