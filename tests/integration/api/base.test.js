const { expect } = require('chai');
const { buildRequest } = require('../../helpers/testServer');

describe('API base tests', () => {
  it('returns a JSON welcome mesaage for the API root', async () => {
    const response = await buildRequest().get('/api');

    expect(response.status).to.equal(200);
    expect(response.type).to.match(/json/);
    expect(response.body).to.deep.equal({
      message: 'Welcome to the Alive Sleep Tracker API',
    });
  });

  it('returns a JSON 404 error for unknown API routes', async () => {
    const missingPath = '/api/does-not-exist';
    const response = await buildRequest().get(missingPath);

    expect(response.status).to.equal(404);
    expect(response.type).to.match(/json/);
    expect(response.body).to.include({
      error: 'Not Found',
      message: 'The requested API endpoint does not exist.',
    });
    expect(response.body.path).to.equal(missingPath);
  });
});

