/**
 * Schedule Controller
 * REST handlers for user schedules.
 */
const { scheduleService } = require('../services');
const { registerJob, unregisterJob } = require('../helpers/scheduler');

async function list(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await scheduleService.listSchedules(userId, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const id = req.params.id;
    const item = await scheduleService.getSchedule(userId, id);
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const data = req.body;
    const item = await scheduleService.createSchedule(userId, data);
    if (item.enabled) registerJob(item);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.message) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const id = req.params.id;
    const data = req.body;
    const item = await scheduleService.updateSchedule(userId, id, data);
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    if (item.enabled) registerJob(item); else unregisterJob(id);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    if (err.message) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const id = req.params.id;
    const item = await scheduleService.deleteSchedule(userId, id);
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    unregisterJob(id);
    res.status(200).json({ success: true, data: item, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

async function toggle(req, res, next) {
  try {
    const userId = res.locals.userRecord._id;
    const id = req.params.id;
    const enabled = !!req.body.enabled;
    const item = await scheduleService.toggleSchedule(userId, id, enabled);
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    if (item.enabled) registerJob(item); else unregisterJob(id);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, toggle };
