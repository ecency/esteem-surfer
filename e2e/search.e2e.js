import chai from "chai";
import testUtils from "./utils";

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;

describe("search", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(async () => {
    await testUtils.timeout(100)
  });


  it('10-Search button should be disabled by default', async function () {
    const d = await this.app.client.getAttribute('.navbar-form .btn-search', 'disabled');
    expect(d).to.deep.equal('true');
  }).timeout(apiTimeout);

  it('20- Fill search input', async function () {
    await this.app.client.click('.navbar-form .txt-search');
    await this.app.client.keys('esteemapp');
  });

  it('30- Search button should be enabled', async function () {
    const d = await this.app.client.getAttribute('.navbar-form .btn-search', 'disabled');
    expect(d).to.deep.equal(null);
  }).timeout(apiTimeout);

  it('40- Submit search', async function () {
    await this.app.client.click('.navbar-form .btn-search');
  }).timeout(apiTimeout);

  it('50- Should be loading', async function () {
    const c = await  this.app.client.getAttribute('.post-list', 'class');
    expect(c.indexOf('fetching') > -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('60- Wait until fetching finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('70- Should be redirected to search page. Url should contain /search/', async function () {
    const u = await this.app.client.getUrl();
    expect(u.indexOf('/search/') > -1).to.deep.equal(true);
  });

  it('80- Search query should be persisted', async function () {
    const v = await this.app.client.getValue('.navbar-form .txt-search');
    expect(v).to.deep.equal('esteemapp');
  });

  it('90- Scroll down', async function () {
    await this.app.client.execute('document.getElementById("content-main").scrollTop=3000');
  });

  it('100- Should load previous posts because of scrolled down', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });

    const postElements = await this.app.client.$$('.post-list .content-list-item-search');
    expect(postElements.length).to.equal(20);
  }).timeout(apiTimeout);

  it('120- Click refresh button', async function () {
    await this.app.client.click('.post-list .btn-reload');
  }).timeout(apiTimeout);

  it('130- Should refresh', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });

    const postElements = await this.app.client.$$('.post-list .content-list-item-search');
    expect(postElements.length).to.equal(10);
  }).timeout(apiTimeout);

  it('140- Enter a permlink to search input', async function () {
    const p = '@good-karma/facebook-is-buying-steem-5ddbec987f18a';
    await this.app.client.execute(`document.querySelector('.navbar-form .txt-search').value='${p}';document.querySelector('.navbar-form .txt-search').dispatchEvent(new Event('change'))`);
  });

  it('150- Submit search', async function () {
    await this.app.client.click('.navbar-form .btn-search');
  });

  it('160- Search button should be disabled', async function () {
    const d = await this.app.client.getAttribute('.navbar-form .btn-search', 'disabled');
    expect(d).to.deep.equal('true');
  });

  it('170- Wait while content loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.navbar-form .btn-search', 'class').then(res => {
        return res !== 'disabled'
      });
    });
  }).timeout(apiTimeout);

  it('180- Should be redirected to content detail page', async function () {
    await testUtils.timeout(2000);
    const u = await this.app.client.getUrl();
    expect(u.indexOf('/post/') > -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('190- Enter a user to search input', async function () {
    const p = '@good-karma';
    await this.app.client.execute(`document.querySelector('.navbar-form .txt-search').value='${p}';document.querySelector('.navbar-form .txt-search').dispatchEvent(new Event('change'))`);
  });

  it('200- Submit search', async function () {
    await this.app.client.click('.navbar-form .btn-search');
  });

  it('210- Search button should be disabled', async function () {
    const d = await this.app.client.getAttribute('.navbar-form .btn-search', 'disabled');
    expect(d).to.deep.equal('true');
  });

  it('220- Wait while user loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.navbar-form .btn-search', 'class').then(res => {
        return res !== 'disabled'
      });
    });
  }).timeout(apiTimeout);

  it('230- Should be redirected to account detail page', async function () {
    await testUtils.timeout(2000);
    const u = await this.app.client.getUrl();
    expect(u.indexOf('/account/') > -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('240- Enter a fake permlink to search input', async function () {
    const p = '@good-karma/facebook-is-buying-steem-5ddbec987f18aXXXXX';
    await this.app.client.execute(`document.querySelector('.navbar-form .txt-search').value='${p}';document.querySelector('.navbar-form .txt-search').dispatchEvent(new Event('change'))`);
  });

  it('250- Submit search', async function () {
    await this.app.client.click('.navbar-form .btn-search');
  });

  it('260- Search button should be disabled', async function () {
    const d = await this.app.client.getAttribute('.navbar-form .btn-search', 'disabled');
    expect(d).to.deep.equal('true');
  });

  it('270- Wait while content loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.navbar-form .btn-search', 'class').then(res => {
        return res !== 'disabled'
      });
    });
  }).timeout(apiTimeout);

  it('280- Should be redirected to search page', async function () {
    await testUtils.timeout(2000);
    const u = await this.app.client.getUrl();
    expect(u.indexOf('/search/') > -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('290- Enter a fake user to search input', async function () {
    const p = '@good-karmaXXXXXXX1';
    await this.app.client.execute(`document.querySelector('.navbar-form .txt-search').value='${p}';document.querySelector('.navbar-form .txt-search').dispatchEvent(new Event('change'))`);
  });

  it('300- Submit search', async function () {
    await this.app.client.click('.navbar-form .btn-search');
  });

  it('310- Search button should be disabled', async function () {
    const d = await this.app.client.getAttribute('.navbar-form .btn-search', 'disabled');
    expect(d).to.deep.equal('true');
  });

  it('320- Wait while user loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.navbar-form .btn-search', 'class').then(res => {
        return res !== 'disabled'
      });
    });
  }).timeout(apiTimeout);

  it('340- Should be redirected to search page', async function () {
    await testUtils.timeout(2000);
    const u = await this.app.client.getUrl();
    expect(u.indexOf('/search/') > -1).to.deep.equal(true);
  }).timeout(apiTimeout);


  /*
  // Enable to see last state of window for a while
  it("Should Wait", function (done) {
    setTimeout(function () {
      done()
    }, 10000)
  }).timeout(11000)
  */

});
