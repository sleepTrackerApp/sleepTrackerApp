const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Sleep Entry Service', () => {
  let sandbox;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getSleepEntries', () => {
    it('should fetch sleep entries with pagination', async () => {
      const mockEntries = [
        {
          _id: 'entry1',
          userId: mockUserId,
          entryDate: new Date('2026-01-01'),
          duration: 480,
        },
      ];
      const mockQuery = {
        sort: sandbox.stub().returnsThis(),
        skip: sandbox.stub().returnsThis(),
        limit: sandbox.stub().resolves(mockEntries),
      };
      const SleepEntryStub = {
        find: sandbox.stub().returns(mockQuery),
        countDocuments: sandbox.stub().resolves(1),
      };

      const sleepEntryService = proxyquire(
        '../../../src/services/sleepEntryService',
        {
          '../models': { SleepEntry: SleepEntryStub },
        }
      );

      const result = await sleepEntryService.getSleepEntries(mockUserId, 1, 10);

      expect(SleepEntryStub.find.calledOnce).to.be.true;
      expect(result.sleepEntries).to.deep.equal(mockEntries);
      expect(result.totalEntries).to.equal(1);
    });
  });

  describe('getSleepEntryByDate', () => {
    it('should find sleep entry by date', async () => {
      const mockEntry = {
        _id: 'entry1',
        userId: mockUserId,
        entryDate: new Date('2026-01-01'),
        duration: 480,
      };
      const SleepEntryStub = {
        findOne: sandbox.stub().resolves(mockEntry),
      };

      const sleepEntryService = proxyquire(
        '../../../src/services/sleepEntryService',
        {
          '../models': { SleepEntry: SleepEntryStub },
        }
      );

      const result = await sleepEntryService.getSleepEntryByDate(
        mockUserId,
        '2026-01-01'
      );

      expect(SleepEntryStub.findOne.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockEntry);
    });
  });

  describe('getOrCreateSleepEntry', () => {
    it('should create new sleep entry with duration', async () => {
      const mockEntry = {
        _id: 'entry1',
        userId: mockUserId,
        entryDate: new Date('2026-01-01'),
        duration: 480,
      };
      const SleepEntryStub = {
        findOneAndUpdate: sandbox.stub().resolves(mockEntry),
      };

      const sleepEntryService = proxyquire(
        '../../../src/services/sleepEntryService',
        {
          '../models': { SleepEntry: SleepEntryStub },
        }
      );

      const entryData = {
        entryTime: '2026-01-01',
        duration: 480,
      };

      const result = await sleepEntryService.getOrCreateSleepEntry(
        mockUserId,
        entryData
      );

      expect(SleepEntryStub.findOneAndUpdate.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockEntry);
    });

    it('should calculate duration from startTime and endTime', async () => {
      const mockEntry = {
        _id: 'entry1',
        userId: mockUserId,
        entryDate: new Date('2026-01-01'),
        duration: 480,
      };
      const SleepEntryStub = {
        findOneAndUpdate: sandbox.stub().resolves(mockEntry),
      };

      const sleepEntryService = proxyquire(
        '../../../src/services/sleepEntryService',
        {
          '../models': { SleepEntry: SleepEntryStub },
        }
      );

      // Use local time strings to ensure date portion matches entryTime
      const entryData = {
        entryTime: '2026-01-01',
        startTime: '2026-01-01T22:00:00',
        endTime: '2026-01-02T06:00:00',
      };

      await sleepEntryService.getOrCreateSleepEntry(mockUserId, entryData);

      const updateCall = SleepEntryStub.findOneAndUpdate.getCall(0);
      const setData = updateCall.args[1].$set;
      expect(setData.duration).to.equal(480);
    });

    it('should throw error if entryTime is missing', async () => {
      const SleepEntryStub = {
        findOneAndUpdate: sandbox.stub(),
      };

      const sleepEntryService = proxyquire(
        '../../../src/services/sleepEntryService',
        {
          '../models': { SleepEntry: SleepEntryStub },
        }
      );

      try {
        await sleepEntryService.getOrCreateSleepEntry(mockUserId, {
          duration: 480,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Entry date is required');
      }
    });
  });

  describe('deleteSleepEntryByDate', () => {
    it('should delete sleep entry by date', async () => {
      const mockDeletedEntry = {
        _id: 'entry1',
        userId: mockUserId,
        entryDate: new Date('2026-01-01'),
        duration: 480,
      };
      const SleepEntryStub = {
        findOneAndDelete: sandbox.stub().resolves(mockDeletedEntry),
      };

      const sleepEntryService = proxyquire(
        '../../../src/services/sleepEntryService',
        {
          '../models': { SleepEntry: SleepEntryStub },
        }
      );

      const result = await sleepEntryService.deleteSleepEntryByDate(
        mockUserId,
        '2026-01-01'
      );

      expect(SleepEntryStub.findOneAndDelete.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockDeletedEntry);
    });
  });
});
