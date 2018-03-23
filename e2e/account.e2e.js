import chai from "chai";
import testUtils from "./utils";
import steem from 'steem';

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;


describe("account", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(async () => {
    await testUtils.timeout(100)
  });

  before(async function () {
    // Delete browser local storage data
    await this.app.client.localStorage('DELETE');

    // User name to test
    this.testUser = 'good-karma';
  });

  it('Unfollow test user before test', async function () {
    const username = this.loginData[1]['username'];
    const wif = this.loginData[1]['active'];
    const following = this.testUser;

    const unfollow = function () {
      return new Promise(function (resolve, reject) {
        const json = ['follow', {follower: username, following: following, what: []}];
        steem.broadcast.customJson(wif, [], [username], 'follow', JSON.stringify(json), (err, response) => {
          if (err) {
            reject(err);
          }
          if (response) {
            resolve(response);
          }
        });
      });
    };

    await unfollow();

  }).timeout(apiTimeout);

  it('Should navigate account page', async function () {
    const url = await this.app.client.getUrl();
    this.urlPrefix = url.split('#')[0];

    const newUrl = `${this.urlPrefix}#!/account/${this.testUser}`;
    await this.app.client.url(newUrl);

  }).timeout(apiTimeout);

  it('Wait until account data loaded', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.the-author', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Header control box should be loaded immediately', async function () {
    const c = await this.app.client.getAttribute('.author-header .control-box', 'class');
    expect(c.indexOf('fetching') === -1).to.deep.equal(true);
  });

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

    await testUtils.timeout(400);

    let e = await this.app.client.isExisting('.modal.login-modal');
    expect(e).to.deep.equal(true);
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

  it('Header control box should be in loading state', async function () {
    const c = await this.app.client.getAttribute('.author-header .control-box', 'class');
    expect(c.indexOf('fetching') !== -1).to.deep.equal(true);
  });

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Follow button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-follow', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Loading icon should be visible in follow button', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow .fa');
    expect(e).to.deep.equal(true);
  });

  it('Wait until visitor data loaded', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.author-header .control-box', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Mute button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(true);
  });

  it('Mute button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-mute', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Wait until following process finished', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.author-header .control-box .btn-follow .fa').then(res => {
        return !res
      });
    });
  }).timeout(apiTimeout);

  it('Unfollow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(true);
  });

  it('Mute button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(true);
  });

  it('Follow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(false);
  });

  it('Unmute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(false);
  });

  it('Click comments', async function () {
    this.app.client.click('.author-navbar .navbar-nav li[data-key="COMMENTS"]');
  });

  // Current location: /account/:id/comments

  it('Comments section should be active', async function () {
    const activeSectionText = await this.app.client.getText('.author-navbar .navbar-nav li.active');
    expect(activeSectionText).to.deep.equal('Comments');

    const contentTitleText = await this.app.client.getText('.author-content header h1');
    expect(contentTitleText).to.deep.equal('Comments');
  });

  it('Content list should be loading', async function () {
    const contentListClass = await this.app.client.getAttribute('.author-content-right .content-list', 'class');
    expect(contentListClass.indexOf('fetching') !== -1).to.deep.equal(true);

    const loadingIconIsVisible = await this.app.client.isVisible('.author-content-right .content-list footer .fa-spin');
    expect(loadingIconIsVisible).to.deep.equal(true);
  });

  it('Account data should be loaded immediately', async function () {
    const c = await this.app.client.getAttribute('.the-author', 'class');
    expect(c.indexOf('fetching') === -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('Header control box should be loaded immediately', async function () {
    const c = await this.app.client.getAttribute('.author-header .control-box', 'class');
    expect(c.indexOf('fetching') === -1).to.deep.equal(true);
  });

  it('Wait while contents completely load', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.author-content-right .content-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Unfollow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(true);
  });

  it('Mute button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(true);
  });

  it('Follow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(false);
  });

  it('Unmute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(false);
  });

  it('Click unfollow button', async function () {
    this.app.client.click('.author-header .control-box .btn-unfollow');
  });

  it('Unfollow button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-unfollow', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Mute button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-mute', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Loading icon should be visible in unfollow button', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow .fa');
    expect(e).to.deep.equal(true);
  });

  it('Wait until unfollowing process finished', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.author-header .control-box .btn-unfollow .fa').then(res => {
        return !res
      });
    });
  }).timeout(apiTimeout);

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Mute button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(true);
  });

  it('Unfollow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(false);
  });

  it('Unmute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(false);
  });

  it('Click replies', async function () {
    this.app.client.click('.author-navbar .navbar-nav li[data-key="REPLIES"]');
  });

  // Current location: /account/:id/replies

  it('Replies section should be active', async function () {
    const activeSectionText = await this.app.client.getText('.author-navbar .navbar-nav li.active');
    expect(activeSectionText).to.deep.equal('Replies');

    const contentTitleText = await this.app.client.getText('.author-content header h1');
    expect(contentTitleText).to.deep.equal('Replies');
  });

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Mute button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(true);
  });

  it('Unfollow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(false);
  });

  it('Unmute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(false);
  });

  it('Click mute button', async function () {
    this.app.client.click('.author-header .control-box .btn-mute');
  });

  it('Mute button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-mute', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Follow button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-follow', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Loading icon should be visible in mute button', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute .fa');
    expect(e).to.deep.equal(true);
  });

  it('Wait until unfollowing process finished', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.author-header .control-box .btn-mute .fa').then(res => {
        return !res
      });
    });
  }).timeout(apiTimeout);

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Unmute button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(true);
  });

  it('Mute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(false);
  });

  it('Unfollow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(false);
  });

  it('Click wallet', async function () {
    this.app.client.click('.author-navbar .navbar-nav li[data-key="WALLET"]');
  });

  // Current location: /account/:id/wallet

  it('Wallet section should be active', async function () {
    const activeSectionText = await this.app.client.getText('.author-navbar .navbar-nav li.active');
    expect(activeSectionText).to.deep.equal('Wallet');

    const contentTitleText = await this.app.client.getText('.author-content header h1');
    expect(contentTitleText).to.deep.equal('Wallet');
  });

  it('Click unmute button', async function () {
    this.app.client.click('.author-header .control-box .btn-unmute');
  });

  it('Unmute button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-unmute', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Follow button should be disabled', async function () {
    const e = await this.app.client.getAttribute('.author-header .control-box .btn-follow', 'disabled');
    expect(e).to.deep.equal('true');
  });

  it('Loading icon should be visible in unmute button', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute .fa');
    expect(e).to.deep.equal(true);
  });

  it('Wait until unmuting process finished', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.author-header .control-box .btn-unmute .fa').then(res => {
        return !res
      });
    });
  }).timeout(apiTimeout);

  it('Wait while transactions completely load', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.author-content-right .content-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Follow button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-follow');
    expect(e).to.deep.equal(true);
  });

  it('Mute button should be visible', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-mute');
    expect(e).to.deep.equal(true);
  });

  it('Unfollow button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unfollow');
    expect(e).to.deep.equal(false);
  });

  it('Unmute button should be hidden', async function () {
    const e = await this.app.client.isExisting('.author-header .control-box .btn-unmute');
    expect(e).to.deep.equal(false);
  });

  it('Scroll down. Should not trigger loading new contents', async function () {
    await this.app.client.execute('document.getElementById("content-main").scrollTop=10000');
  });

  it('Content list should not be loading', async function () {
    const contentListClass = await this.app.client.getAttribute('.author-content-right .content-list', 'class');
    expect(contentListClass.indexOf('fetching') === -1).to.deep.equal(true);
  });

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  // Current location: /account/:id/replies

  it('Replies section should be active', async function () {
    const activeSectionText = await this.app.client.getText('.author-navbar .navbar-nav li.active');
    expect(activeSectionText).to.deep.equal('Replies');

    const contentTitleText = await this.app.client.getText('.author-content header h1');
    expect(contentTitleText).to.deep.equal('Replies');
  });

  it('Account data should be loaded immediately', async function () {
    const c = await this.app.client.getAttribute('.the-author', 'class');
    expect(c.indexOf('fetching') === -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('Content data should be loaded immediately', async function () {
    const c = await this.app.client.getAttribute('.author-content-right .content-list', 'class');
    expect(c.indexOf('fetching') === -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('Scroll down', async function () {
    const ee = await this.app.client.$$('.author-content-right .content-list .content-list-item-child');
    this.lastContentCount = ee.length;
    await this.app.client.execute('document.getElementById("content-main").scrollTop=10000');
  });

  it('"Refresh button" should be disabled while posts loading', async function () {
    const isDisabled = await this.app.client.getAttribute('.author-content-right .content-list .btn-reload', 'disabled');
    expect(isDisabled).to.deep.equal('true');
  });

  it('Wait while new replies loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.author-content-right .content-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Should load new replies', async function () {
    const postElements = await this.app.client.$$('.author-content-right .content-list .content-list-item-child');
    expect(postElements.length > this.lastContentCount).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('Scroll top', async function () {
    await this.app.client.execute('document.getElementById("content-main").scrollTop=0');
  });

  it('Click first reply to see detail', async function () {
    let elements = await this.app.client.$$('.author-content-right .content-list .content-list-item-child .content-body-title a');
    await this.app.client.elementIdClick(elements[0].ELEMENT);
  }).timeout(15000);

  // Current location: /post/...

  it('Should redirected to post page', async function () {
    const url = await this.app.client.getUrl();
    expect(url.indexOf('/post/') > -1).to.deep.equal(true);
  }).timeout(200);

  it('Wait while comments are loading', async function () {
    await testUtils.timeout(400);
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.indicator.comments-indicator').then(res => {
        return !res
      });
    });
  }).timeout(apiTimeout);

  it('Selected comment should be highlighted', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.comment-list-item.selected').then(res => {
        return res
      });
    });
  }).timeout(apiTimeout);

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
    await testUtils.timeout(300);
  });

  // Current location: /account/:id/replies

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
    await testUtils.timeout(300);
  });

  // Current location: /account/:id/comments

  it('Comments section should be active', async function () {
    const activeSectionText = await this.app.client.getText('.author-navbar .navbar-nav li.active');
    expect(activeSectionText).to.deep.equal('Comments');

    const contentTitleText = await this.app.client.getText('.author-content header h1');
    expect(contentTitleText).to.deep.equal('Comments');
  });

  it('Click "reload button"', async function () {
    await this.app.client.click('.content-list .btn-reload');
  });

  it('"Refresh button" should disabled while loading', async function () {
    const isDisabled = await this.app.client.getAttribute('.content-list .btn-reload', 'disabled');
    expect(isDisabled).to.deep.equal('true');
  });

  it('Wait while comments loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.author-content-right .content-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('Should load comments', async function () {
    const postElements = await this.app.client.$$('.author-content-right .content-list .content-list-item-child');
    expect(postElements.length > 1).to.deep.equal(true);
  }).timeout(apiTimeout);

  // Enable to see last state of window for a while
  it("Should Wait", function (done) {
    setTimeout(function () {
      done()
    }, 10000)
  }).timeout(11000)
});
