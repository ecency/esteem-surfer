import chai from "chai";
import testUtils from "./utils";

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;


describe("account", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(async () => {
    await testUtils.timeout(200)
  });

  before(async function () {
    // Delete browser local storage data
    await this.app.client.localStorage('DELETE');
  });

  it('Should navigate account page', async function () {
    const url = await this.app.client.getUrl();
    this.urlPrefix = url.split('#')[0];

    const newUrl = `${this.urlPrefix}#!/author/good-karma`;
    await this.app.client.url(newUrl);

  }).timeout(apiTimeout);

  it('Wait until page completely load', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.the-author', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);


  /*
  it('Header control box should be loading', async function () {
    const c = await this.app.client.getAttribute('.author-header .control-box', 'class');
    console.log(c)
    // expect(c.indexOf('fetching') !== -1).to.deep.equal(true);
  });
*/

  it('Blog section should be active', async function () {
    const activeSectionText = await this.app.client.getText('.author-navbar .navbar-nav li.active');
    expect(activeSectionText).to.deep.equal('Blog');

    const contentTitleText = await this.app.client.getText('.author-content header h1');
    expect(contentTitleText).to.deep.equal('Blog');
  });

  it('Follower and following counts should be loaded', async function () {
    const followerCount = parseInt(await this.app.client.getText('.author-content-left .author-prop-follower-count .prop-value'));
    expect(followerCount).to.be.at.least(0);

    const followingCount = parseInt(await this.app.client.getText('.author-content-left .author-prop-following-count .prop-value'));
    expect(followingCount).to.be.at.least(0);
  });

  it('Account profile data should be merged', async function () {
    const profileBgImage = await this.app.client.getCssProperty('.author-header .profile-image', 'background-image');
    expect(profileBgImage.value.trim().length).to.be.at.least(5);

    const coverBgImage = await this.app.client.getCssProperty('.author-header .cover-image', 'background-image');
    expect(coverBgImage.value.trim().length).to.be.at.least(5);

    const aboutText = await this.app.client.getText('.author-content-left .author-bio');
    expect(aboutText.trim().length).to.be.at.least(5);

    const websiteText = await this.app.client.getText('.author-content-left .author-prop-website .prop-value');
    expect(websiteText.trim().length).to.be.at.least(5);
  });

  it('Content list should be loading', async function () {
    const contentListClass = await this.app.client.getAttribute('.author-content-right .content-list', 'class');
    expect(contentListClass.indexOf('fetching') !== -1).to.deep.equal(true);

    const loadingIconIsVisible = await this.app.client.isVisible('.author-content-right .content-list footer .fa-spin');
    expect(loadingIconIsVisible).to.deep.equal(true);
  });

  it('Wait while contents completely load', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.author-content-right .content-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);


  /* ---
  it('Follow button should be disabled while visitor data loading', async function () {
    const d = await this.app.client.getAttribute('.author-header .control-box .btn-follow', 'disabled');
    expect(d).to.deep.equal(true);
  });
*/

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Unfollow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(false);
  });

  it('Mute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(false);
  });

  it('Unmute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(false);
  });

  it('Login dialog should be opened when follow clicked', async function () {
    this.app.client.click('.author-header .control-box .btn-follow');

    await testUtils.timeout(200);

    // Login dialog should be opened
    let e = await this.app.client.isExisting('.modal.login-modal');
  });

  it('Username field should be focused', async function () {
    await testUtils.timeout(800);
    const f = await this.app.client.hasFocus('#login-username');
    expect(f).to.deep.equal(true);
  });

  it('Should fill login form and submit', async function () {
    const username = this.loginData[1]['username'];
    const code = this.loginData[1]['master'];

    await this.app.client.setValue('#login-username', username);
    await this.app.client.setValue('#login-code', code);
    this.app.client.click('#btn-login');
  }).timeout(5000);

  it('It should login and close dialog', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.modal.login-modal').then(res => {
        return !res;
      });
    });
  }).timeout(apiTimeout);

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Follow button should be disabled', async function () {
    const d = await this.app.client.getAttribute('.author-header .control-box .btn-follow', 'disabled');
    expect(d).to.deep.equal('true');
  });

  it('Unfollow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(false);
  });

  it('Mute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(false);
  });

  it('Unmute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(false);
  });

  it('Wait until visitor data loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.author-header .control-box', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Follow button should be enabled', async function () {
    const d = await this.app.client.getAttribute('.author-header .control-box .btn-follow', 'disabled');
    expect(d).to.deep.equal(null);
  });


  // Click follow button
  // Loading icon should be visible
  // Wait to finish loading process

  // Follow button should be disabled
  // Unfollow button should be visible
  // Mute button should be visible
  // Unmute button should be hidden

  // Go /
  // Return to user
  // Wait loading everything

  // Follow button should be disabled
  // Unfollow button should be visible
  // Mute button should be visible
  // Unmute button should be hidden


  //  Click unfollow
  // ...


  // Enable to see last state of window for a while
  it("Should Wait", function (done) {
    setTimeout(function () {
      done()
    }, 10000)
  }).timeout(11000)


});
