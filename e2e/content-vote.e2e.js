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

  it('10- Refresh', async function () {
    await this.app.client.url(await this.app.client.getUrl());
    await testUtils.timeout(1000)
  }).timeout(3000);

  it('20- Wait while window loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isVisible('body').then(res => res);
    });
  }).timeout();

  it('30- Go to /created (new) page', async function () {
    await this.app.client.click('.navbar-nav .filter-dropdown .dropdown-toggle');
    await this.app.client.click('.navbar li[data-key="NEW"]');
  });

  it('40- Wait while posts loading', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    });

    const elements = await this.app.client.$$('.post-list-item .post-up-vote div a');
    this.element = elements[0];
    this.element2 = elements[2];

  }).timeout(apiTimeout);

  it('50- Login dialog should be opened when vote button clicked', async function () {
    this.app.client.elementIdClick(this.element.value.ELEMENT);
    await testUtils.timeout(400); // // Wait for modal transitions
    let e = await this.app.client.isExisting('.modal.login-modal');
    expect(e).to.deep.equal(true);
  });

  it('60- Fill login form with username and posting wif and submit', async function () {
    const username = this.loginData[0]['username'];
    const wif = this.loginData[0]['posting'];

    await this.app.client.execute(`document.getElementById('login-username').value='${username}';document.getElementById('login-username').dispatchEvent(new Event('change'))`);
    await this.app.client.execute(`document.getElementById('login-code').value='${wif}';document.getElementById('login-code').dispatchEvent(new Event('change'))`);

    this.app.client.click('#btn-login');
  }).timeout(apiTimeout);

  it('70- Login dialog should be closed', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.modal.login-modal').then(res => {
        return !res;
      });
    });
  })

  it('80- Should start to fetch active votes ', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('fetching') !== -1;
      });
    });
  });

  it('90- Wait until fetching finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('100- Click vote button', async function () {
    this.app.client.elementIdClick(this.element.value.ELEMENT);
  }).timeout(apiTimeout);

  it('110- Should start voting', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') !== -1;
      });
    });
  });

  it('120- Wait until voting finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('130- Should be marked as voted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') !== -1).to.deep.equal(true);
  });

  it('140- Click vote button', async function () {
    await this.app.client.elementIdClick(this.element.value.ELEMENT);
  });

  it('150- Should start unvoting', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') !== -1;
      });
    });
  });

  it('160- Wait until unvoting finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('170- Should be marked as unvoted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') === -1).to.deep.equal(true);
  });

  it('180- Hover on vote button', async function () {
    await this.app.client.moveTo(this.element.value.ELEMENT, 0, 0);
    await testUtils.timeout(3500);
  }).timeout(5000);

  it('190- Slider popover should opened', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(true);
  });

  it('200- Hover out vote button', async function () {
    await this.app.client.moveTo(this.element.value.ELEMENT, 300, 300);
    await testUtils.timeout(1500);
  }).timeout(2000);

  it('210- Slider popover should closed', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(false);
  });

  it('220- Hover on vote button', async function () {
    await this.app.client.moveTo(this.element.value.ELEMENT, 0, 0);
    await testUtils.timeout(2500);
  }).timeout(5000);

  it('221- Slider popover should opened', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(true);
  });

  it('230- Change slider value', async function () {
    await this.app.client.click('.content-vote-popover .rz-tick:nth-child(3)');
  });

  it('240- Slider value should be changed', async function () {
    const v = await this.app.client.getText('.content-vote-popover .slider-tooltip .tooltip-perc');
    expect(v !== '100').to.deep.equal(true);
  });

  it('250- Click slider save button', async function () {
    await this.app.client.click('.content-vote-popover .btn-slider-save');
    await testUtils.timeout(400);
  });

  it('260- Slider popover should closed after save', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(false);
  });

  it('270- Should start voting', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') !== -1;
      });
    });
  });

  it('280- Wait until voting finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('290- Should be marked as voted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') !== -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('300- Hover on vote button', async function () {
    await this.app.client.moveTo(this.element.value.ELEMENT, 0, 0);
    await testUtils.timeout(2500);
  }).timeout(5000);

  it('310- Should slider popover opened', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(true);
  });

  it('320- Slider value should be changed', async function () {
    const v = await this.app.client.getText('.content-vote-popover .slider-tooltip .tooltip-perc');
    expect(v !== '100').to.deep.equal(true);
  });

  it('330- Hover out vote button', async function () {
    await this.app.client.moveTo(this.element.value.ELEMENT, 300, 300);
    await testUtils.timeout(1500);
  }).timeout(2000);

  it('340- Slider popover should be closed', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(false);
  });

  it('350- Logout', async function () {
    await this.app.client.click('.navbar-nav .user-dropdown .dropdown-toggle');
    await this.app.client.click('.navbar-nav .user-dropdown li[data-key="LOGOUT"] a');
  });

  it('360- Should be marked as unvoted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') === -1).to.deep.equal(true);
  }).timeout();

  it('370- Click vote button', async function () {
    this.app.client.elementIdClick(this.element.value.ELEMENT);
  });

  it('380- Login dialog should be opened', async function () {
    await testUtils.timeout(400); // // Wait for modal transitions
    let e = await this.app.client.isExisting('.modal.login-modal');
    expect(e).to.deep.equal(true);
  });

  it('390- Fill login form with username and posting wif and submit', async function () {
    const username = this.loginData[0]['username'];
    const wif = this.loginData[0]['posting'];

    await this.app.client.execute(`document.getElementById('login-username').value='${username}';document.getElementById('login-username').dispatchEvent(new Event('change'))`);
    await this.app.client.execute(`document.getElementById('login-code').value='${wif}';document.getElementById('login-code').dispatchEvent(new Event('change'))`);

    this.app.client.click('#btn-login');
  }).timeout(apiTimeout);

  it('400- It should close login dialog', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.modal.login-modal').then(res => {
        return !res;
      });
    });
  }).timeout(apiTimeout);

  it('410- It should start to fetch active votes ', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('fetching') !== -1;
      });
    });
  });

  it('420- Wait until fetching finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('fetching') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('430- Should be marked as voted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') !== -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('440- Click vote button 2 fo second element', async function () {
    this.app.client.elementIdClick(this.element2.value.ELEMENT);
  }).timeout(apiTimeout);

  it('450- Should start voting', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element2.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') !== -1;
      });
    });
  });

  it('460- Wait until voting finish', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.elementIdAttribute(this.element2.value.ELEMENT, 'class').then(res => {
        return res.value.indexOf('voting') === -1;
      });
    });
  }).timeout(apiTimeout);

  it('470- Should be marked as voted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element2.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') !== -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  it('480- Hover on vote button 2', async function () {
    await this.app.client.moveTo(this.element2.value.ELEMENT, 0, 0);
    await testUtils.timeout(2500);
  }).timeout(5000);

  it('490- Should slider popover opened', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(true);
  });

  it('500- Slider value should be changed', async function () {
    const v = await this.app.client.getText('.content-vote-popover .slider-tooltip .tooltip-perc');
    expect(v !== '100').to.deep.equal(true);
  });

  it('510- Hover out vote button', async function () {
    await this.app.client.moveTo(this.element2.value.ELEMENT, 300, 300);
    await testUtils.timeout(1500);
  }).timeout(2000);

  it('520- Slider popover should be closed', async function () {
    let e = await this.app.client.isExisting('.content-vote-popover');
    expect(e).to.deep.equal(false);
  });

  it('530- Logout', async function () {
    await this.app.client.click('.navbar-nav .user-dropdown .dropdown-toggle');
    await this.app.client.click('.navbar-nav .user-dropdown li[data-key="LOGOUT"] a');
  });

  it('540- Should be marked as unvoted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') === -1).to.deep.equal(true);

    const b = await this.app.client.elementIdAttribute(this.element2.value.ELEMENT, 'class');
    expect(b.value.indexOf('voted') === -1).to.deep.equal(true);
  }).timeout();

  it('550- Click vote button', async function () {
    this.app.client.elementIdClick(this.element2.value.ELEMENT);
  });

  it('560- Login dialog should be opened', async function () {
    await testUtils.timeout(400); // // Wait for modal transitions
    let e = await this.app.client.isExisting('.modal.login-modal');
    expect(e).to.deep.equal(true);
  });

  it('570- Fill login form with username and posting wif and submit', async function () {
    const username = this.loginData[0]['username'];
    const wif = this.loginData[0]['posting'];

    await this.app.client.execute(`document.getElementById('login-username').value='${username}';document.getElementById('login-username').dispatchEvent(new Event('change'))`);
    await this.app.client.execute(`document.getElementById('login-code').value='${wif}';document.getElementById('login-code').dispatchEvent(new Event('change'))`);

    this.app.client.click('#btn-login');
  }).timeout(apiTimeout);

  it('580- It should close login dialog', async function () {
    await this.app.client.waitUntil(() => {
      return this.app.client.isExisting('.modal.login-modal').then(res => {
        return !res;
      });
    });
  }).timeout(apiTimeout);

  it('590- Wait for a while', async function () {
    await testUtils.timeout(4000);
  }).timeout(5000);


  it('600- Vote buttons should be marked as voted', async function () {
    const a = await this.app.client.elementIdAttribute(this.element.value.ELEMENT, 'class');
    expect(a.value.indexOf('voted') !== -1).to.deep.equal(true);

    const b = await this.app.client.elementIdAttribute(this.element2.value.ELEMENT, 'class');
    expect(b.value.indexOf('voted') !== -1).to.deep.equal(true);
  }).timeout(apiTimeout);

  // TODO: REVIEW AND ADD UNVOTE

  // Enable to see last state of window for a while
  it("Should Wait", function (done) {
    setTimeout(function () {
      done()
    }, 10000)
  }).timeout(11000)

});
