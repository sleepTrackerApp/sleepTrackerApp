const { expect } = require('chai');
const sinon = require('sinon');
const { getSleepEntries } = require('../../../src/controllers/sleepEntriesController');
const { sleepEntriesService } = require('../../../src/services');

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
                userRecords: { _id: "auth0|123"} 
            },
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        }; 
        
        const falseEntries = [
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
        ];

        sinon.stub(sleepEntriesService, "getAllSleepEntries").resolves(falseEntries);

        await getSleepEntries(req, res);

        expect( res.status.calledOnceWithExactly(200) ).to.be.true;
        expect(
            res.json.calledOnceWithExactly({
            success: true,
            count: 2,
            data: falseEntries
        })
    ).to.be.true;
    });
});

