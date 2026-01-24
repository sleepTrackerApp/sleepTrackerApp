$(function () {
  // Load Goal DOM elements
  const $goalLoading = $('#goal-loading');
  const $goalFormWrapper = $('#goal-form-wrapper');
  const $goalSummaryWrapper = $('#goal-summary-wrapper');
  const $goalError = $('#goal-error');
  const $goalHoursSelect = $('#goal-hours');
  const $goalMinutesSelect = $('#goal-minutes');
  const $goalSaveBtn = $('#goal-save-btn');
  const $goalChangeBtn = $('#goal-change-btn');
  const $goalCancelLink = $('#goal-cancel-link');
  const $goalSummaryCurrent = $('#goal-summary-current');
  const $goalSummaryDate = $('#goal-summary-date');
  const $goalProgressMessage = $('#goal-progress-message');
  const $goalProgressEmpty = $('#goal-progress-empty');
  const $goalProgressContent = $('#goal-progress-content');
  const $goalProgressChartEl = $('#goal-progress-chart');
  const $goalProgressAverageEl = $('#goal-progress-average');
  const $goalProgressAverageLabelEl = $('#goal-progress-average-label');
  const $goalProgressRecordedEl = $('#goal-progress-recorded');
  const $goalProgressProjectedEl = $('#goal-progress-projected');
  const $goalProgressSummaryEl = $('#goal-progress-summary');
  const $goalHistoryCard = $('#goal-history-card');
  const $goalHistoryMonthEl = $('#goal-history-month');
  const $goalHistoryGrid = $('#goal-history-grid');
  const $goalHistoryEmpty = $('#goal-history-empty');
  const $goalProgressCard = $('.goal-progress-card');

  let currentGoal = { goalValue: 0, setDate: null };
  let isSavingGoal = false;
  let goalProgressChart = null;

  // Function to show/hide loading indicator
  function setGoalLoadingVisible(visible) {
    if ($goalLoading.length) {
      $goalLoading.css('display', visible ? 'flex' : 'none');
    }
  }

  // Function to reset error message
  function resetGoalError() {
    if ($goalError.length) {
      $goalError.hide().text('');
    }
  }

  // Function to show goal form
  function showGoalForm(prefillMinutes) {
    if (!$goalFormWrapper.length || !$goalSummaryWrapper.length) return;

    const minutes =
      typeof prefillMinutes === 'number' && prefillMinutes > 0
        ? prefillMinutes
        : 480; // default 8h
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if ($goalHoursSelect.length) $goalHoursSelect.val(String(hours));
    if ($goalMinutesSelect.length) $goalMinutesSelect.val(String(mins));

    if ($goalCancelLink.length) {
      const hasExistingGoal =
        currentGoal && currentGoal.goalValue && currentGoal.goalValue > 0;
      if (hasExistingGoal) {
        $goalCancelLink.show();
      } else {
        $goalCancelLink.hide();
      }
    }

    $goalSummaryWrapper.hide();
    $goalFormWrapper.css('display', 'flex');
    resetGoalError();
  }

  // Function to show goal summary
  function showGoalSummary(goal) {
    if (!$goalFormWrapper.length || !$goalSummaryWrapper.length) return;

    currentGoal = goal || { goalValue: 0, setDate: null };
    const hasGoal = !!(currentGoal.goalValue && currentGoal.goalValue > 0);

    if ($goalCancelLink.length) {
      $goalCancelLink.hide();
    }

    if (hasGoal) {
      const hours = Math.floor(currentGoal.goalValue / 60);
      const mins = currentGoal.goalValue % 60;

      if ($goalSummaryCurrent.length) {
        const hasMinutes = mins !== 0;
        const minutesPart = hasMinutes ? ` ${mins} mins` : '';
        $goalSummaryCurrent.text(`${hours} hrs${minutesPart} / night`);
      }

      if ($goalSummaryDate.length) {
        if (currentGoal.setDate) {
          const d = new Date(currentGoal.setDate);
          $goalSummaryDate.text(
            d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          );
        } else {
          $goalSummaryDate.text('');
        }
      }

      $goalFormWrapper.hide();
      $goalSummaryWrapper.css('display', 'flex');
    } else {
      showGoalForm();
    }

    if ($goalProgressMessage.length) {
      if (hasGoal) {
        $goalProgressMessage.text('');
      } else {
        $goalProgressMessage.text(
          'To start tracking your sleep goal progress, please set a nightly sleep duration goal.',
        );
      }
    }
  }

  // Function to load goal from server
  function loadGoal() {
    if (!$goalFormWrapper.length || !$goalSummaryWrapper.length) return;

    setGoalLoadingVisible(true);
    $goalFormWrapper.hide();
    $goalSummaryWrapper.hide();

    $.ajax({
      url: '/api/goal',
      method: 'GET',
      dataType: 'json',
    })
      .done((payload) => {
        const goal =
          payload && payload.data ? payload.data : { goalValue: 0, setDate: null };
        showGoalSummary(goal);
      })
      .fail((xhr, status, err) => {
        console.error('[Dashboard] Error loading goal', err || status);
        if ($goalError.length) {
          $goalError
            .text('Unable to load your goal right now. Please try again later.')
            .show();
        }
      })
      .always(() => {
        setGoalLoadingVisible(false);
      });
  }

  // Function to render goal history grid
  function renderGoalHistory(daily, monthInfo) {
    if (!$goalHistoryGrid.length || !monthInfo) return;

    $goalHistoryGrid.empty();
    if ($goalHistoryEmpty.length) {
      $goalHistoryEmpty.hide().text('');
    }

    const monthYearValid =
      typeof monthInfo.year === 'number' && typeof monthInfo.month === 'number';

    if (!monthYearValid) {
      if ($goalHistoryCard.length) {
        $goalHistoryCard.hide();
      }
      return;
    }

    const year = monthInfo.year;
    const monthIndex = monthInfo.month - 1; // 0-based

    if ($goalHistoryMonthEl.length) {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const idx = Math.min(Math.max(monthIndex, 0), 11);
      $goalHistoryMonthEl.text(`Goal history: ${monthNames[idx]} ${year}`);
    }

    const entriesByDay = {};
    if (Array.isArray(daily)) {
      daily.forEach((entry) => {
        if (!entry || !entry.date) return;
        const d = new Date(entry.date);
        if (Number.isNaN(d.getTime())) return;
        if (d.getFullYear() !== year || d.getMonth() !== monthIndex) return;
        entriesByDay[d.getDate()] = entry;
      });
    }

    const hasHistoryData = Object.values(entriesByDay).some((entry) => {
      return (
        entry &&
        ((entry.goalMet === true || entry.goalMet === false) ||
          typeof entry.duration === 'number')
      );
    });

    if (!hasHistoryData) {
      if ($goalHistoryCard.length) {
        $goalHistoryCard.hide();
      }
      return;
    }

    if ($goalHistoryCard.length) {
      $goalHistoryCard.css('display', 'flex');
    }

    const daysInMonth =
      typeof monthInfo.totalDays === 'number' && monthInfo.totalDays > 0
        ? monthInfo.totalDays
        : new Date(year, monthIndex + 1, 0).getDate();

    const firstOfMonth = new Date(year, monthIndex, 1);
    const jsDay = firstOfMonth.getDay(); // 0=Sun..6=Sat
    const leadingBlanks = (jsDay + 6) % 7; // Monday = 0

    for (let i = 0; i < leadingBlanks; i += 1) {
      const $cell = $('<div>').addClass('goal-history-cell goal-history-cell--placeholder');
      $cell.append(
        $('<div>').addClass('goal-history-icon goal-history-icon--empty'),
        $('<div>').addClass('goal-history-day').text(''),
      );
      $goalHistoryGrid.append($cell);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const entry = entriesByDay[day];

      let iconClass = 'goal-history-icon--empty';
      let iconHtml = '';

      if (entry && entry.goalMet === true) {
        iconClass = 'goal-history-icon--met';
        iconHtml = '<i class="fa-solid fa-check"></i>';
      } else if (entry && entry.goalMet === false) {
        iconClass = 'goal-history-icon--missed';
        iconHtml = '<i class="fa-solid fa-xmark"></i>';
      }

      const $cell = $('<div>').addClass('goal-history-cell');
      $cell.append(
        $('<div>')
          .addClass(`goal-history-icon ${iconClass}`)
          .html(iconHtml),
        $('<div>').addClass('goal-history-day').text(day),
      );

      $goalHistoryGrid.append($cell);
    }
  }

  // Function to load goal progress from server
  function loadGoalProgress() {
    if (!$goalProgressChartEl.length) return;

    if ($goalProgressEmpty.length) {
      $goalProgressEmpty.hide().text('');
    }
    if ($goalProgressContent.length) {
      $goalProgressContent.hide();
    }

    $.ajax({
      url: '/api/goal/progress',
      method: 'GET',
      dataType: 'json',
    })
      .done((payload) => {
        if ($goalProgressCard.length) {
          $goalProgressCard.css('display', 'flex');
        }
        if (!payload || !payload.success || !payload.data) {
          throw new Error('Invalid goal progress payload');
        }

        const { stats, month, daily } = payload.data;
        const {
          nightsMetGoal,
          nightsTotalWithGoal,
          nightsWithData,
          averageDurationMinutes,
          projectedSuccessPercent,
          averageLabel,
          summaryMessage,
        } = stats;

        const totalDaysInMonth =
          month && typeof month.totalDays === 'number'
            ? month.totalDays
            : nightsTotalWithGoal;

        const hasAnyGoalThisMonth =
          nightsTotalWithGoal !== null &&
          nightsTotalWithGoal !== undefined &&
          nightsTotalWithGoal > 0;

        if (hasAnyGoalThisMonth) {
          renderGoalHistory(daily, month);
        } else if ($goalHistoryCard.length) {
          // No goal set at all – hide history entirely
          $goalHistoryCard.hide();
        }

        const hasAnyData = nightsWithData && nightsWithData > 0;

        if ($goalProgressRecordedEl.length) {
          $goalProgressRecordedEl.text(`${nightsWithData || 0} / ${totalDaysInMonth}`);
        }

        if (!hasAnyData) {
          // No sleep data recorded yet.
          if ($goalProgressEmpty.length) {
            $goalProgressEmpty
              .text('Please record at least one night to see your progress.')
              .show();
          }
          return;
        }

        if (!nightsTotalWithGoal || nightsTotalWithGoal === 0) {
          // User has sleep data but no goal yet.
          return;
        }

        const successPercent =
          projectedSuccessPercent !== null && projectedSuccessPercent !== undefined
            ? projectedSuccessPercent
            : 0;

        if (window.ApexCharts && $goalProgressChartEl.length) {
          const options = {
            chart: {
              type: 'radialBar',
              height: 260,
            },
            series: [successPercent],
            labels: ['Nights'],
            plotOptions: {
              radialBar: {
                hollow: {
                  size: '60%',
                },
                track: {
                  background: '#CDEBFF',
                  strokeWidth: '90%',
                  margin: 0,
                },
                dataLabels: {
                  name: {
                    show: true,
                    fontSize: '14px',
                    color: '#000000',
                    offsetY: 22,
                  },
                  value: {
                    show: true,
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#000000',
                    offsetY: -10,
                    formatter() {
                      return `${nightsMetGoal} / ${totalDaysInMonth}`;
                    },
                  },
                },
              },
            },
            stroke: {
              lineCap: 'round',
            },
            fill: {
              type: 'gradient',
              gradient: {
                shade: 'light',
                type: 'horizontal',
                gradientToColors: ['#00C6FF'],
                stops: [0, 100],
              },
            },
            colors: ['#009DFF'],
          };

          if (goalProgressChart) {
            goalProgressChart.updateOptions(options);
          } else {
            goalProgressChart = new window.ApexCharts(
              $goalProgressChartEl.get(0),
              options,
            );
            goalProgressChart.render();
          }
        }

        const formatMinutes = (mins) => {
          if (mins === null || mins === undefined) return '-';
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          if (m === 0) return `${h}h`;
          return `${h}h ${m}m`;
        };

        if ($goalProgressAverageEl.length) {
          $goalProgressAverageEl.text(formatMinutes(averageDurationMinutes));
        }

        if ($goalProgressAverageLabelEl.length) {
          $goalProgressAverageLabelEl.text(
            averageLabel ? `(${averageLabel})` : '',
          );
        }

        if ($goalProgressProjectedEl.length) {
          $goalProgressProjectedEl.text(
            projectedSuccessPercent !== null &&
              projectedSuccessPercent !== undefined
              ? `~${projectedSuccessPercent}%`
              : '-',
          );
        }

        if ($goalProgressSummaryEl.length) {
          $goalProgressSummaryEl.text(summaryMessage || '');
        }

        if ($goalProgressContent.length) {
          $goalProgressContent.show();
        }
      })
      .fail((xhr, status, err) => {
        console.error('[Dashboard] Error loading goal progress', err || status);
        if ($goalProgressCard.length) {
          $goalProgressCard.css('display', 'flex');
        }
        if ($goalProgressEmpty.length) {
          $goalProgressEmpty
            .text('Unable to load goal progress right now. Please try again later.')
            .show();
        }
      });
  }

  // ----- Event bindings -----

  if ($goalChangeBtn.length) {
    $goalChangeBtn.on('click', () => {
      showGoalForm(currentGoal.goalValue);
    });
  }

  if ($goalCancelLink.length) {
    $goalCancelLink.on('click', (evt) => {
      evt.preventDefault();
      if (isSavingGoal) return;
      resetGoalError();
      showGoalSummary(currentGoal);
    });
  }

  if ($goalSaveBtn.length) {
    $goalSaveBtn.on('click', (evt) => {
      evt.preventDefault();
      if (isSavingGoal) return;
      if (!$goalHoursSelect.length || !$goalMinutesSelect.length) return;

      const hours = parseInt($goalHoursSelect.val() || '0', 10);
      const minutes = parseInt($goalMinutesSelect.val() || '0', 10);
      const totalMinutes = hours * 60 + minutes;

      resetGoalError();

      if (Number.isNaN(totalMinutes) || totalMinutes < 360 || totalMinutes > 775) {
        const msg = 'Please set a goal between 6 hours and 12 hours.';
        if ($goalError.length) {
          $goalError.text(msg).show();
        } else if (window.M && window.M.toast) {
          window.M.toast({ html: msg, classes: 'red rounded' });
        }
        return;
      }

      isSavingGoal = true;
      const originalLabel = $goalSaveBtn.text();
      $goalSaveBtn.text('Saving...').prop('disabled', true);

      $.ajax({
        url: '/api/goal',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ value: totalMinutes }),
      })
        .done((payload, _status, xhr) => {
          if (!xhr || xhr.status < 200 || xhr.status >= 300 || !payload || payload.success === false) {
            const errMsg =
              payload && payload.error && payload.error.message
                ? payload.error.message
                : 'Unable to save goal. Please try again.';
            if ($goalError.length) {
              $goalError.text(errMsg).show();
            } else if (window.M && window.M.toast) {
              window.M.toast({ html: errMsg, classes: 'red rounded' });
            }
            return;
          }

          window.location.reload();
        })
        .fail((_xhr, _status, err) => {
          console.error('[Dashboard] Error saving goal', err);
          const msg = 'Unexpected error while saving goal. Please try again.';
          if ($goalError.length) {
            $goalError.text(msg).show();
          } else if (window.M && window.M.toast) {
            window.M.toast({ html: msg, classes: 'red rounded' });
          }
        })
        .always(() => {
          isSavingGoal = false;
          $goalSaveBtn.text(originalLabel).prop('disabled', false);
        });
    });
  }

  // ----- Initial load -----

  if ($goalFormWrapper.length && $goalSummaryWrapper.length) {
    loadGoal();
    loadGoalProgress();
  }
});

