import chai from "chai";
import testUtils from "./utils";
import steem from 'steem';

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;


describe("content-vote", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(async () => {
    await testUtils.timeout(100)
  });

  before(async function () {
    // Delete browser local storage data
    await this.app.client.localStorage('DELETE');
  });

  it('Go to /new page', async function () {
    await testUtils.timeout(1000); // Wait for application to open

    await this.app.client.click('.navbar-nav .filter-dropdown .dropdown-toggle');
    await this.app.client.click('.navbar li[data-key="NEW"]');
  }).timeout(apiTimeout);

  // click vote
  // should open login window
  // enter memo key
  // should open login window
  // enter active key
  // should open login window
  // enter posting key
  // should login window closed


  // Enable to see last state of window for a while
  it("Should Wait", function (done) {
    setTimeout(function () {
      done()
    }, 10000)
  }).timeout(11000)

});
