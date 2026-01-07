const { expect } = require('chai');
const sinon = require('sinon');
const { getSleepEntries } = require('../../../src/controllers/sleepEntriesController');
const { userService, sleepEntriesService } = require('../../../src/services');

describe("Sleep entries controller tests", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("pull sleep data correctly", async () => {
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
        
        sinon.stub(userService, "findUserByAuthId").resolves({});
        sinon.stub(sleepEntriesService, "getAllSleepEntries").resolves([
            { id: 1 },
            { id: 2 }
        ]);

        await getSleepEntries(req, res);

        expect( res.status.calledOnceWithExactly(200) ).to.be.true;
        expect(
            res.json.calledOnceWithExactly({
            success: true,
            count: 2,
            data: [
                { id: 1 },
                { id: 2 }
            ]
        })
    ).to.be.true;
    });
});

