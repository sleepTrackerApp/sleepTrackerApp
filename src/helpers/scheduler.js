/**
 * Lightweight scheduler to run user schedules using node-cron.
 * Loads enabled schedules at startup and registers cron jobs.
 */
const cron = require('node-cron');
const { Schedule } = require('../models');
const socketService = require('../services/socketService');

const jobs = new Map(); // key: scheduleId -> cron task
let ioInstance = null; // Socket.IO instance (kept for backwards compatibility)

/**
 * Set the Socket.IO instance for sending notifications
 */
function setSocketIO(io) {
  ioInstance = io;
}

async function loadEnabledSchedules() {
  return Schedule.find({ enabled: true });
}

function registerJob(schedule) {
  const id = String(schedule._id);
  if (!schedule.cron) return;
  // Avoid duplicate
  if (jobs.has(id)) {
    jobs.get(id).stop();
    jobs.delete(id);
  }

  const task = cron.schedule(schedule.cron, async () => {
    try {
      // Placeholder: perform action based on schedule.type
      // For now, just log and update lastRunAt
      console.log(`[Scheduler] Trigger ${schedule.type} '${schedule.name}' for user ${schedule.userId}`);

      schedule.lastRunAt = new Date();
      await schedule.save();

      // Send notification via Socket.IO if available
      if (ioInstance && schedule.type === 'bedtime') {
        sendBedtimeNotification(schedule);
      }
    } catch (err) {
      console.error('Scheduler task failed:', err);
    }
  }, { scheduled: true });

  jobs.set(id, task);
}

/**
 * Send bedtime notification to all users via Socket.IO service
 */
function sendBedtimeNotification(schedule) {
  socketService.broadcastNotification({
    type: 'bedtime',
    title: 'Bedtime Reminder',
    message: `It's time for bed! ${schedule.name}`,
    scheduleName: schedule.name,
    timestamp: new Date(),
  });
  console.log(`[Scheduler] Sent bedtime notification for schedule: ${schedule.name}`);
}

function unregisterJob(scheduleId) {
  const id = String(scheduleId);
  const task = jobs.get(id);
  if (task) {
    try { task.stop(); } catch {}
    jobs.delete(id);
    console.log(`[Scheduler] Unregistered job ${id}.`);
  }
}

async function startScheduler() {
  const enabled = await loadEnabledSchedules();
  enabled.forEach(registerJob);
  console.log(`[Scheduler] Registered ${enabled.length} job(s).`);
}

function stopScheduler() {
  jobs.forEach((task) => task.stop());
  jobs.clear();
}

module.exports = { startScheduler, stopScheduler, registerJob, unregisterJob, setSocketIO };
