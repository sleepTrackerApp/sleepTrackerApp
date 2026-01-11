const { expect } = require('chai');
const sinon = require('sinon');
const { sleepEntryController } = require('../../../src/controllers');
const { sleepEntryService } = require('../../../src/services');

describe("Sleep entries controller tests", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("pull sleep data correctly", async () => {
        const req = {
            query: {},
        }; 

        const res = {
            locals: {
                userRecord: { _id: "auth0|123"}
            },
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        }; 
        
        const falseEntries = {
            sleepEntries: [
                {
                    _id: "701111111111111111111111",
                    userId: "1",
                    entryDate: new Date("2024-01-01"),
                    hours: 7,
                    startTime: new Date("2024-01-01T22:30:00Z"),
                    endTime: new Date("2024-01-02T05:30:00Z"),
                    rating: 4
                },
                {
                    _id: "702222222222222222222222",
                    userId: "1",
                    entryDate: new Date("2024-01-02"),
                    hours: 6,
                    startTime: new Date("2024-01-02T23:00:00Z"),
                    endTime: new Date("2024-01-03T05:00:00Z"),
                    rating: 3
                }
            ],
            totalEntries: 2,
            totalPages: 1,
            currentPage: 1
        };

        sinon.stub(sleepEntryService, "getSleepEntries").resolves(falseEntries);

        await sleepEntryController.getSleepEntries(req, res);

        expect( res.status.calledOnceWithExactly(200) ).to.be.true;
        expect(
            res.json.calledOnceWithExactly({
            success: true,
            data: falseEntries
        })
    ).to.be.true;
    });
});

