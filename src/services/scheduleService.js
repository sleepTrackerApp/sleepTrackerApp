/**
 * Service layer for Schedule CRUD and utilities.
 */
const { Schedule } = require('../models');

function buildCronFromBedtimeRule(timeOfDay, daysOfWeek) {
  if (!timeOfDay || typeof timeOfDay.hour !== 'number' || typeof timeOfDay.minute !== 'number') {
    throw new Error('Invalid timeOfDay: expected hour and minute');
  }
  const minute = Math.max(0, Math.min(59, timeOfDay.minute));
  const hour = Math.max(0, Math.min(23, timeOfDay.hour));
  const dow = Array.isArray(daysOfWeek) && daysOfWeek.length ? daysOfWeek.join(',') : '*';
  // cron format: m h * * dow
  return `${minute} ${hour} * * ${dow}`;
}

async function listSchedules(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const items = await Schedule.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Schedule.countDocuments({ userId });
  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

async function getSchedule(userId, id) {
  return Schedule.findOne({ _id: id, userId });
}

async function createSchedule(userId, data) {
  const doc = new Schedule({ userId, ...data });
  // derive cron for bedtime type
  if (doc.type === 'bedtime') {
    doc.cron = buildCronFromBedtimeRule(doc.timeOfDay, doc.daysOfWeek);
  }
  return doc.save();
}

async function updateSchedule(userId, id, data) {
  const existing = await getSchedule(userId, id);
  if (!existing) return null;
  Object.assign(existing, data);
  if (existing.type === 'bedtime') {
    existing.cron = buildCronFromBedtimeRule(existing.timeOfDay, existing.daysOfWeek);
  }
  return existing.save();
}

async function deleteSchedule(userId, id) {
  return Schedule.findOneAndDelete({ _id: id, userId });
}

/**
 * Delete all schedule for user.
 * @param userId - ID of the user object
 */

async function deleteUser(userId) {
  return Schedule.deleteMany({ userId });
}


async function toggleSchedule(userId, id, enabled) {
  return Schedule.findOneAndUpdate({ _id: id, userId }, { enabled: !!enabled }, { new: true });
}

module.exports = {
  listSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  deleteUser,
  toggleSchedule,
  buildCronFromBedtimeRule,
};
