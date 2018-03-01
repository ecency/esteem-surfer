import chai from "chai";
import testUtils from "./utils";

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;


describe("Post detail test 2. Testing with a new post. Asuuming it has no comments", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(async () => {
    await testUtils.timeout(400)
  });

  let postTitle = '';
  let postBody = '';
  let postParent = '';

  it('Wait while window loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isVisible('body').then(res => res);
    });
    await testUtils.timeout(200);
  });

  it('Should switch to "New" filter', async function () {
    await this.app.client.click('.navbar .filter-dropdown');
    await this.app.client.click('.navbar li[data-key="NEW"] a');
  });

  it('Should go post detail after picked the first post from post list.', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });

    let postBtns = await this.app.client.$$('.post-list .post-list-item .post-date a');
    this.app.client.elementIdClick(postBtns[0].ELEMENT);
  }).timeout(apiTimeout);

  it('Should load post data completely', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.the-post', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });

    postTitle = await this.app.client.getText('.post-page .post-title');
    postBody = await this.app.client.getText('.post-page .post-body');
    postParent = await this.app.client.getText('.post-page .post-cat a');
  }).timeout(apiTimeout);

  it('Should has no comments', async function () {
    const isVisible = await this.app.client.isVisible('.the-post .post-comment-list-empty');
    expect(isVisible).to.deep.equal(true);
  });

  it('Should go related tag with filter when clicked parent', async function () {
    await this.app.client.click('.the-post .post-cat a');
    let url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/created/' + postParent);
  });

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  it('Content should be same', async function () {
    let t = await this.app.client.getText('.post-page .post-title');
    let b = await this.app.client.getText('.post-page .post-body');

    expect(t).to.deep.equal(postTitle);
    expect(b).to.deep.equal(postBody);
  });

  it('Should go related tag with filter when clicked tag', async function () {
    let tagElems = await this.app.client.$$('.the-post .tag-list a');
    const [first] = Object.keys(tagElems);
    let tagElem = tagElems[first];
    let tag = await this.app.client.elementIdText(tagElem.value.ELEMENT);
    await this.app.client.elementIdClick(tagElem.value.ELEMENT);
    let url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/created/' + tag.value);
  });

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  it('Content should be same', async function () {
    let t = await this.app.client.getText('.post-page .post-title');
    let b = await this.app.client.getText('.post-page .post-body');

    expect(t).to.deep.equal(postTitle);
    expect(b).to.deep.equal(postBody);
  });

  it('Go Trending', async function () {
    await this.app.client.click('.navbar .filter-dropdown');
    await this.app.client.click('.navbar li[data-key="TRENDING"] a');

    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Go Votes', async function () {
    await this.app.client.click('.navbar .filter-dropdown');
    await this.app.client.click('.navbar li[data-key="VOTES"] a');

    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Go detail of firs post on VOTES list', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });

    let postBtns = await this.app.client.$$('.post-list .post-list-item .post-comment-count a');
    this.app.client.elementIdClick(postBtns[0].ELEMENT);
  }).timeout(apiTimeout);

  it('Wait while loading the post under VOTES list', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.the-post', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it("Go back 3 times", async function () {
    await this.app.client.click('.navbar .navbar-back a');
    await this.app.client.click('.navbar .navbar-back a');
    await this.app.client.click('.navbar .navbar-back a');
  });

  it('Content should be same', async function () {
    let t = await this.app.client.getText('.post-page .post-title');
    let b = await this.app.client.getText('.post-page .post-body');

    expect(t).to.deep.equal(postTitle);
    expect(b).to.deep.equal(postBody);
  });

  /*
  // Enable to see last state of window for a while
  it("Should Wait", function (done) {
    setTimeout(function () {
      done()
    }, 10000)
  }).timeout(11000)
  */

});
