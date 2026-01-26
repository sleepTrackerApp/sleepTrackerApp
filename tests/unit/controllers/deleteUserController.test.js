const { expect } = require("chai");
const sinon = require("sinon");

const { deleteAllUserData } = require("../../../src/controllers/deleteUserController");
const {
  sleepEntryService,
  weeklySummaryService,
  goalService,
  messageService,
  scheduleService,
  userService,
} = require("../../../src/services");

describe("Delete User Data Controller", () => {
  const mockUserId = "507f1f77bcf86cd799439011";
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      locals: {
        userRecord: { _id: mockUserId }
      },
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      send: sinon.stub(),
      redirect: sinon.stub() // ignored
    };
    next = sinon.stub();

    sinon.stub(sleepEntryService, "deleteUser").resolves();
    sinon.stub(weeklySummaryService, "deleteUser").resolves();
    sinon.stub(goalService, "deleteUser").resolves();
    sinon.stub(messageService, "deleteUser").resolves();
    sinon.stub(scheduleService, "deleteUser").resolves();
    sinon.stub(userService, "deleteUser").resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should delete all data from models using their service", async () => {
    await deleteAllUserData(req, res, next);

    expect(sleepEntryService.deleteUser.calledOnceWith(mockUserId)).to.be.true;
    expect(weeklySummaryService.deleteUser.calledOnceWith(mockUserId)).to.be.true;
    expect(goalService.deleteUser.calledOnceWith(mockUserId)).to.be.true;
    expect(messageService.deleteUser.calledOnceWith(mockUserId)).to.be.true;
    expect(scheduleService.deleteUser.calledOnceWith(mockUserId)).to.be.true;
    expect(userService.deleteUser.calledOnceWith(mockUserId)).to.be.true;

  });

  it('should return 400 if date parameter is missing', async () => {
    const error = new Error("Delete failed");
    sleepEntryService.deleteUser.rejects(error);

    await deleteAllUserData(req, res, next);

    expect(next.calledOnceWith(error)).to.be.true;
  });
});

