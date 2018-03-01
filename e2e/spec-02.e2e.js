import chai from "chai";
import testUtils from "./utils";

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;


describe("Post detail test 1. Testing with a trending post. Asuuming it has a lot of comments", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(async () => {
    await testUtils.timeout(400)
  });

  it('Should go post detail after picked a post from post list.', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });

    let posts = await this.app.client.$$('.post-list .post-list-item .post-body-title a');
    this.app.client.elementIdClick(posts[1].ELEMENT);
  }).timeout(apiTimeout);

  it('Should show post immediately', async function () {
    const isVisible = await this.app.client.isVisible('.post-page .indicator.post-indicator');
    expect(isVisible).to.deep.equal(false);
  }).timeout(100);

  it("Comments should be loading in background", async function () {
    const isVisible = await this.app.client.isVisible('.post-page .indicator.comments-indicator');
    expect(isVisible).to.deep.equal(true);
  }).timeout(200);

  it("Author data should be loading in background", async function () {
    await this.app.client.click('.the-post .post-header .post-author a');
    let popovers = await this.app.client.$$('.the-post .post-header .post-author .popover');
    expect(popovers.length).to.deep.equal(0);
  }).timeout(200);

  it('Should load post data completely', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.the-post', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Should show user popover', async function () {
    await this.app.client.click('.the-post .post-header .post-author a');
    let popovers = await this.app.client.$$('.the-post .post-header .post-author .popover');
    expect(popovers.length).to.deep.equal(1);
  });

  it('Should list comments.', async function () {
    const comments = await this.app.client.$$('.the-post .post-comment-list .comment-list-item');
    expect(comments.length).to.be.at.least(10);
  });

  it('Should pagination prev button disabled', async function () {
    const prop = await this.app.client.getCssProperty('.the-post .post-comment-list .comment-list-header .list-pagination .btn-prev', 'pointer-events');
    expect(prop.value).to.deep.equal('none');
  });

  let totalPages = 0;
  it('Get comments page count', async function () {
    totalPages = parseInt(await this.app.client.getText('.the-post .post-comment-list .comment-list-header .list-pagination .total-pages'));
    expect(totalPages).to.be.at.least(2);
  });

  it('Click comments pagination next button until the end', async function () {
    for (let i = 0; i < (totalPages - 1); i++) {
      await this.app.client.click('.the-post .post-comment-list .comment-list-header .list-pagination .btn-next');
      const comments = await this.app.client.$$('.the-post .post-comment-list .comment-list-item');
      expect(comments.length).to.be.at.least(1);
    }
  }).timeout(10000);

  it('Should pagination prev button enabled', async function () {
    const prop = await this.app.client.getCssProperty('.the-post .post-comment-list .comment-list-header .list-pagination .btn-prev', 'pointer-events');
    expect(prop.value).to.deep.equal('auto');
  });

  it('Should pagination next button disabled', async function () {
    const prop = await this.app.client.getCssProperty('.the-post .post-comment-list .comment-list-header .list-pagination .btn-next', 'pointer-events');
    expect(prop.value).to.deep.equal('none');
  });

  it('Click comments pagination prev button until the beginnig', async function () {
    for (let i = 0; i < (totalPages - 1); i++) {
      await this.app.client.click('.the-post .post-comment-list .comment-list-header .list-pagination .btn-prev');
      const comments = await this.app.client.$$('.the-post .post-comment-list .comment-list-item');
      expect(comments.length).to.be.at.least(1);
    }
  }).timeout(10000);

  it('Should pagination prev button disabled', async function () {
    const prop = await this.app.client.getCssProperty('.the-post .post-comment-list .comment-list-header .list-pagination .btn-prev', 'pointer-events');
    expect(prop.value).to.deep.equal('none');
  });

  it('Pick 5 comments and click authors. Popovers should be opened.', async function () {
    let elements = await this.app.client.$$('.the-post .post-comment-list .comment-list-item .comment-author');
    for (let i = 0; i < 5; i++) {
      let el = elements[i];

      await this.app.client.elementIdClick(el.ELEMENT);

      // Popover should be opened
      let popovers = await this.app.client.elementIdElements(el.ELEMENT, '.popover');
      expect(popovers.value.length).to.deep.equal(1);

      await testUtils.timeout(400);
      await this.app.client.click('.the-post');
      await testUtils.timeout(400);
    }
  }).timeout(10000);

  /*
  // Enable to see last state of window for a while
  it("Should Wait", function (done) {
    setTimeout(function () {
      done()
    }, 10000)
  }).timeout(11000)
  */

});
