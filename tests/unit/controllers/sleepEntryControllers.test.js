const { expect } = require('chai');
const sinon = require('sinon');
const { sleepEntryController } = require('../../../src/controllers');
const { sleepEntryService } = require('../../../src/services');

describe('Sleep Entry Controller', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      locals: {
        userRecord: { _id: mockUserId }
      },
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getSleepEntries', () => {
    it('should return sleep entries with pagination', async () => {
      const mockEntries = {
        sleepEntries: [{ _id: 'entry1', duration: 480 }],
        totalEntries: 1,
        totalPages: 1,
        currentPage: 1
      };

      sinon.stub(sleepEntryService, 'getSleepEntries').resolves(mockEntries);

      await sleepEntryController.getSleepEntries(req, res, next);

      expect(sleepEntryService.getSleepEntries.calledOnceWith(mockUserId, 1, 50, null, null)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        success: true,
        data: mockEntries
      })).to.be.true;
    });
  });

  describe('getSleepEntryByDate', () => {
    it('should return sleep entry by date', async () => {
      const mockEntry = { _id: 'entry1', entryDate: new Date('2024-01-01'), duration: 480 };
      req.params.date = '2024-01-01';

      sinon.stub(sleepEntryService, 'getSleepEntryByDate').resolves(mockEntry);

      await sleepEntryController.getSleepEntryByDate(req, res, next);

      expect(sleepEntryService.getSleepEntryByDate.calledOnceWith(mockUserId, '2024-01-01')).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        success: true,
        data: mockEntry
      })).to.be.true;
    });

    it('should return 404 if entry not found', async () => {
      req.params.date = '2024-01-01';
      sinon.stub(sleepEntryService, 'getSleepEntryByDate').resolves(null);

      await sleepEntryController.getSleepEntryByDate(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sleep entry not found'
        }
      })).to.be.true;
    });

    it('should return 400 if date parameter is missing', async () => {
      req.params.date = undefined;

      await sleepEntryController.getSleepEntryByDate(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Date parameter is required'
        }
      })).to.be.true;
    });
  });

  describe('createOrUpdateSleepEntry', () => {
    it('should create or update sleep entry', async () => {
      const mockEntry = { _id: 'entry1', duration: 480 };
      req.body = { entryTime: '2024-01-01', duration: 480 };

      sinon.stub(sleepEntryService, 'getOrCreateSleepEntry').resolves(mockEntry);

      await sleepEntryController.createOrUpdateSleepEntry(req, res, next);

      expect(sleepEntryService.getOrCreateSleepEntry.calledOnceWith(mockUserId, req.body)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        success: true,
        data: mockEntry
      })).to.be.true;
    });

    it('should return 400 on validation error', async () => {
      req.body = { entryTime: '2024-01-01', duration: 480 };
      const validationError = new Error('Entry date is required');

      sinon.stub(sleepEntryService, 'getOrCreateSleepEntry').rejects(validationError);

      await sleepEntryController.createOrUpdateSleepEntry(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Entry date is required'
        }
      })).to.be.true;
    });
  });

  describe('deleteSleepEntry', () => {
    it('should delete sleep entry by date', async () => {
      const mockDeletedEntry = { _id: 'entry1', duration: 480 };
      req.params.date = '2024-01-01';

      sinon.stub(sleepEntryService, 'deleteSleepEntryByDate').resolves(mockDeletedEntry);

      await sleepEntryController.deleteSleepEntry(req, res, next);

      expect(sleepEntryService.deleteSleepEntryByDate.calledOnceWith(mockUserId, '2024-01-01')).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        success: true,
        data: mockDeletedEntry,
        message: 'Sleep entry deleted successfully'
      })).to.be.true;
    });

    it('should return 404 if entry not found', async () => {
      req.params.date = '2024-01-01';
      sinon.stub(sleepEntryService, 'deleteSleepEntryByDate').resolves(null);

      await sleepEntryController.deleteSleepEntry(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sleep entry not found'
        }
      })).to.be.true;
    });

    it('should return 400 if date parameter is missing', async () => {
      req.params.date = undefined;

      await sleepEntryController.deleteSleepEntry(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Date parameter is required'
        }
      })).to.be.true;
    });
  });
});

