const { expect } = require('chai');
const { buildRequest } = require('../../helpers/testServer');

describe('Public pages base tests', () => {
  it('renders the home page successfully', async () => {
    const response = await buildRequest().get('/');

    expect(response.status).to.equal(200);
    expect(response.type).to.match(/html/);
    expect(response.text).to.include('Wake Up Truly Alive');
  });

  it('renders the 404 page for unknown routes', async () => {
    const response = await buildRequest().get('/404');

    expect(response.status).to.equal(404);
    expect(response.type).to.match(/html/);
    expect(response.text).to.include('404 - Page Not Found');
  });
});


