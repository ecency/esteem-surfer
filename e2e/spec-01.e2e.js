import chai from "chai";
import testUtils from "./utils";

chai.use(require('chai-string'));

const expect = chai.expect;

const apiTimeout = 50000;


describe("Spec 01", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);
  afterEach(testUtils.afterEach);

  // Current location: #!/posts/trending

  it('By default it should be redirected to /posts/trending', async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/trending');
  });

  it('"Back button" should be hidden', async function () {
    const isVisible = await this.app.client.isVisible('.navbar .navbar-back');
    expect(isVisible).to.deep.equal(false);
  });

  it("Should load tags", async function () {
    const tagElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list ul.tag-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.side-tag-list ul.tag-list li')
    });

    expect(tagElements.length).to.greaterThan(10);
  }).timeout(apiTimeout);

  it('"Remove tag" button should be hidden', async function () {
    const isVisible = await this.app.client.isVisible('.side-tag-list .btn-remove-tag');
    expect(isVisible).to.deep.equal(false);
  });

  it('"Refresh button" should disabled while loading', async function () {
    const isDisabled = await this.app.client.getAttribute('.post-list .btn-reload', 'disabled');
    expect(isDisabled).to.deep.equal('true');
  });

  it('Should load posts', async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(20);
  }).timeout(apiTimeout);

  it('"Refresh button" should be enabled when loading posts finished', async function () {
    const isDisabled = await this.app.client.getAttribute('.post-list .btn-reload', 'disabled');
    expect(isDisabled).to.deep.equal(null);
  });

  it('Scroll down', async function () {
    await this.app.client.execute('document.getElementById("content-main").scrollTop=3000');
  });

  it('"Refresh button" should be disabled while posts loading', async function () {
    const isDisabled = await this.app.client.getAttribute('.post-list .btn-reload', 'disabled');
    expect(isDisabled).to.deep.equal('true');
  });

  it("Should load previous posts because of scrolled down", async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(39);
  }).timeout(apiTimeout);

  it("Should load previous posts because of scrolled down (Again)", async function () {
    const postElements = await this.app.client.execute('document.getElementById("content-main").scrollTop=7000')
      .then(() => {
        return this.app.client.waitUntil(() => {
          return this.app.client.getAttribute('.post-list', 'class').then(res => {
            return res.indexOf('fetching') === -1;
          });
        });
      })
      .then(() => {
        return this.app.client.$$('.post-list .post-list-item')
      });

    expect(postElements.length).to.equal(58);
  }).timeout(apiTimeout);

  it('Click "photography" tag', async function () {
    await this.app.client.click('.side-tag-list ul.tag-list li[data-key="photography"] a')
  });

  // Current location: #!/posts/trending/photography

  it('Current location should be changed to /posts/trending/photography', async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/trending/photography');
  });

  it('"Back button" should be visible', async function () {
    const isVisible = await this.app.client.isVisible('.navbar .navbar-back');
    expect(isVisible).to.deep.equal(true);
  });

  it('"Remove tag" button should be visible', async function () {
    const isVisible = await this.app.client.isVisible('.side-tag-list .btn-remove-tag');
    expect(isVisible).to.deep.equal(true);
  });

  it('Selected tag should be active', async function () {
    const c = await this.app.client.getAttribute('.side-tag-list ul.tag-list li[data-key="photography"]', 'class');
    expect(c.indexOf('active') !== -1).to.deep.equal(true);
  });

  it('Should load posts', async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(20);
  }).timeout(apiTimeout);

  it('Click "remove tag" button', async function () {
    await this.app.client.click('.side-tag-list .btn-remove-tag');
  });

  // Current location: #!/posts/trending

  it("Current location should be changed to /posts/trending", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/trending');
  });

  it("Should be posts loaded immediately from nav history", async function () {
    const postElements = await this.app.client.$$('.post-list .post-list-item');
    expect(postElements.length).to.equal(58);
  }).timeout(50);

  it('Should switch to "promoted" filter', async function () {
    await this.app.client.click('.navbar li[data-key="PROMOTED"] a');
  });

  // Current location: #!/posts/promoted

  it("Current location should be changed to /posts/promoted", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/promoted');
  });

  it('"Promoted button" on the navbar should be selected', async function () {
    const c = await this.app.client.getAttribute('.navbar li[data-key="PROMOTED"]', 'class');
    expect(c.indexOf('active') !== -1).to.deep.equal(true);
  });

  it("Should load posts", async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(20);
  }).timeout(apiTimeout);

  it("Scroll down", async function () {
    await this.app.client.execute('document.getElementById("content-main").scrollTop=3000');
  });

  it('Should load previous posts because of scrolled down', async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(39);
  }).timeout(apiTimeout);

  it('Click "reload button"', async function () {
    await this.app.client.click('.post-list .btn-reload');
  });

  it("Should load posts", async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(20);
  }).timeout(apiTimeout);

  it('Click "life" tag', async function () {
    await this.app.client.click('.side-tag-list ul.tag-list li[data-key="life"] a')
  });

  // Current location: #!/posts/promoted/life

  it("Current location should be changed to promoted/life", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/promoted/life');
  });

  it("Should load posts", async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(20);
  }).timeout(apiTimeout);

  it('Should switch to "comments" filter', async function () {
    await this.app.client.click('.navbar li[data-key="COMMENTS"] a');
  });

  // Current location: #!/posts/children/life

  it("Current location should be changed to /posts/children/life", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/children/life');
  });

  it("Should load posts", async function () {
    const postElements = await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.$$('.post-list .post-list-item')
    });

    expect(postElements.length).to.equal(20);
  }).timeout(apiTimeout);

  // -----

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  // Current location: #!/posts/promoted/life

  it("Current location should be changed to /posts/promoted/life", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/promoted/life');
  });

  it("Should be posts loaded immediately from nav history", async function () {
    const postElements = await this.app.client.$$('.post-list .post-list-item');
    expect(postElements.length).to.equal(20);
  }).timeout(50);

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  // Current location: #!/posts/promoted

  it("Current location should be changed to /posts/promoted", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/promoted');
  });

  it("Should be posts loaded immediately from nav history", async function () {
    const postElements = await this.app.client.$$('.post-list .post-list-item');
    expect(postElements.length).to.equal(20);
  }).timeout(50);

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  // Current location: #!/posts/trending

  it("Current location should be changed to /posts/trending", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/trending');
  });

  it("Should be posts loaded immediately from nav history", async function () {
    const postElements = await this.app.client.$$('.post-list .post-list-item');
    expect(postElements.length).to.equal(58);
  }).timeout(50);

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  // Current location: #!/posts/trending/photography

  it("Current location should be changed to /posts/trending/photography", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/trending/photography');
  });

  it("Should be posts loaded immediately from nav history", async function () {
    const postElements = await this.app.client.$$('.post-list .post-list-item');
    expect(postElements.length).to.equal(20);
  }).timeout(50);

  it("Go back", async function () {
    await this.app.client.click('.navbar .navbar-back a');
  });

  // Current location: #!/posts/trending

  it("Current location should be changed to /posts/trending", async function () {
    const url = await this.app.client.getUrl();
    expect(url).to.endWith('#!/posts/trending');
  });

  it("Should be posts loaded immediately from nav history", async function () {
    const postElements = await this.app.client.$$('.post-list .post-list-item');
    expect(postElements.length).to.equal(58);
  }).timeout(50);

  it('Back button should be hidden', async function () {
    const isVisible = await this.app.client.isVisible('.navbar .navbar-back');
    expect(isVisible).to.deep.equal(false);
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


