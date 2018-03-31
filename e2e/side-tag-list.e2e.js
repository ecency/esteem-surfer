import chai from "chai";
import testUtils from "./utils";

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;

describe("side-tag-list", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(async () => {
    await testUtils.timeout(100)
  });

  it('10- Wait until fetching finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
    this.firstTag = await this.app.client.getText('.side-tag-list .tag-list li:nth-child(1)');
  }).timeout(apiTimeout);

  it('20- Filter input should be hidden', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .tag-filter');
    expect(v).to.deep.equal(false);
  });

  it('21- Loading icon should be hidden', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .loading-icon');
    expect(v).to.deep.equal(false);
  });

  it('30- Click filter button', async function () {
    await this.app.client.click('.side-tag-list .btn-filter-tag');
  });

  it('40- Filter input should be visible', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .tag-filter');
    expect(v).to.deep.equal(true);
  });

  it('50- Filter input should be focused', async function () {
    const f = await this.app.client.hasFocus('#txt-filter-tag');
    expect(f).to.deep.equal(true);
  });

  it('60- Click filter button', async function () {
    await this.app.client.click('.side-tag-list .btn-filter-tag');
  });

  it('70- Filter should be hidden', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .tag-filter');
    expect(v).to.deep.equal(false);
  });

  it('80- Click filter button', async function () {
    await this.app.client.click('.side-tag-list .btn-filter-tag');
  });

  it('90- Fill filter input', async function () {
    await this.app.client.keys('esteem');
  });

  it('100- Should start fetching', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list', 'class').then(res => {
        return res.indexOf('fetching') > -1;
      });
    });
  });

  it('101- Loading icon should be visible', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .loading-icon');
    expect(v).to.deep.equal(true);
  });

  it('110- Wait until fetching finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('111- Loading icon should be hidden', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .loading-icon');
    expect(v).to.deep.equal(false);
  });

  it('120- Tag list should be changed', async function () {
    const t = await this.app.client.getText('.side-tag-list .tag-list li:nth-child(1)');
    expect(t === this.firstTag).to.deep.equal(false);
    this.secondTag = await this.app.client.getText('.side-tag-list .tag-list li:nth-child(1)');
  });

  it('130- Fill filter input', async function () {
    await this.app.client.clearElement('#txt-filter-tag');
    await this.app.client.keys('steem');
  });

  it('140- Should start fetching', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list', 'class').then(res => {
        return res.indexOf('fetching') > -1;
      });
    });
  });

  it('150- Wait until fetching finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('160- Tag list should be changed', async function () {
    const t = await this.app.client.getText('.side-tag-list .tag-list li:nth-child(1)');
    expect(t === this.secondTag).to.deep.equal(false);
  });

  it('170- Click first tag', async function () {
    this.firstTag = await this.app.client.getText('.side-tag-list .tag-list li:nth-child(1)');
    await this.app.client.click('.side-tag-list .tag-list li a:nth-child(1)');
  });

  it('180- Should load list immediately', async function () {
    const c = await this.app.client.getAttribute('.side-tag-list', 'class');
    expect(c.indexOf('fetching')).to.deep.equal(-1);

    const t = await this.app.client.getText('.side-tag-list .tag-list li:nth-child(1)');
    expect(t === this.firstTag).to.deep.equal(true);
  });

  it('190- Clicked tag should has selected class', async function () {
    const c = await this.app.client.getAttribute('.side-tag-list .tag-list li:nth-child(1)', 'class');
    expect(c.indexOf('active') > -1).to.deep.equal(true);
  });

  it('200- Filter input should be visible', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .tag-filter');
    expect(v).to.deep.equal(true);
  });

  it('210- Filter input value should be persisted', async function () {
    const v = await this.app.client.getValue('#txt-filter-tag');
    expect(v).to.deep.equal('steem');
  });

  it('220- Should be redirected. Url should contain /posts/', async function () {
    const u = await this.app.client.getUrl();
    expect(u.indexOf('/posts/') > -1).to.deep.equal(true);
  });

  it('230- Click close filter tag button', async function () {
    await this.app.client.click('#btn-close-filter-tag');
  });

  it('240- Filter input should be hidden', async function () {
    const v = await this.app.client.isVisible('.side-tag-list .tag-filter');
    expect(v).to.deep.equal(false);
  });

  it('250- Should start fetching', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list', 'class').then(res => {
        return res.indexOf('fetching') > -1;
      });
    });
  });

  it('260- Wait until fetching finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
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
