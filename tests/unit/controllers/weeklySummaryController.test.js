const { expect } = require('chai');
const sinon = require('sinon');

const { getWeeklySummary } = require('../../../src/controllers/weeklySummaryController');
const { userService, weeklySummaryService } = require('../../../src/services');

describe("Weekly summary data controller tests", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("pull weekly summary data correctly", async () => {
        const req = {
            oidc: { 
                user: { sub: "auth0|123" } 
            }, 
            query: {},
        }; 

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        }; 
        
        const falseEntries = [
            {
                _id: "701111111111111111111111",
                userId: "1",
                date: new Date("2024-01-01T22:30:00Z"),
                avgHours: 25,
            },
            {
                _id: "702222222222222222222222",
                userId: "1",
                date: new Date("2024-01-02T23:00:00Z"),
                avgHours: 19,
            }
        ];

        sinon.stub(userService, "findUserByAuthId").resolves({});
        sinon.stub(weeklySummaryService, "getAllWeeklySummary").resolves(falseEntries);

        await getWeeklySummary(req, res);

        expect( res.status.calledOnceWithExactly(200) ).to.be.true;
        expect(
            res.json.calledOnceWithExactly({
            success: true,
            data: falseEntries
        })
    ).to.be.true;
    });
});



