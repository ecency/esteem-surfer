const util = require('util')

import {expect} from "chai";
import testUtils from "./utils";


describe("Spec 01", () => {

  before(testUtils.beforeTest);
  after(testUtils.afterTest);

  // Current location: #!/posts/trending

  it("By default should be redirected to trending posts page", function (done) {
    this.app.client.getUrl().then(url => {
      expect(url.endsWith('#!/posts/trending')).to.equal(true);
      done();
    })
  });

  it("Should load tags", function (done) {
    this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.side-tag-list ul.tag-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.elements('.side-tag-list ul.tag-list li').then(res => {
        expect(res.value.length).to.greaterThan(10);
        done();
      })
    })
  }).timeout(5000);

  it('Should remove tag button hidden', function (done) {
    this.app.client.isVisible('.side-tag-list .btn-remove-tag').then(v => {
      expect(v).to.deep.equal(false);
      done();
    })
  });

  it("Should refresh button disabled while loading", function (done) {
    this.app.client.getAttribute('.post-list .btn-reload', 'disabled').then(a => {
      expect(a).to.deep.equal('true');
      done();
    })
  });

  it("Should load posts", function (done) {
    this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.elements('.post-list .post-list-item').then(res => {
        expect(res.value.length).to.equal(20);
        done();
      })
    })
  }).timeout(50000);

  it("Should refresh button enabled while not loading", function (done) {
    this.app.client.getAttribute('.post-list .btn-reload', 'disabled').then(a => {
      expect(a).to.deep.equal(null);
      done();
    })
  });

  it("Should load previous posts when scrolled down. (should refresh button disabled while loading)", function (done) {
    this.app.client.execute('document.getElementById("content-main").scrollTop=3000')
      .then(() => {
        return this.app.client.getAttribute('.post-list .btn-reload', 'disabled').then(a => {
          expect(a).to.deep.equal('true');
        })
      })
      .then(() => {
        return this.app.client.waitUntil(() => { // Wait for loading post list
          return this.app.client.getAttribute('.post-list', 'class').then(res => {
            return res.indexOf('fetching') === -1;
          });
        });
      })
      .then(() => {
        return this.app.client.elements('.post-list .post-list-item').then(res => {
          expect(res.value.length).to.equal(39);
          done();
        })
      })
  }).timeout(50000);

  it("Should load previous posts when scrolled down (Again)", function (done) {
    this.app.client.execute('document.getElementById("content-main").scrollTop=7000')
      .then(() => {
        return this.app.client.waitUntil(() => {
          return this.app.client.getAttribute('.post-list', 'class').then(res => {
            return res.indexOf('fetching') === -1;
          });
        });
      })
      .then(() => {
        return this.app.client.elements('.post-list .post-list-item').then(res => {
          expect(res.value.length).to.equal(58);
          done();
        })
      })
  }).timeout(50000);

  it("Click a tag", function (done) {
    this.app.client.click('.side-tag-list ul.tag-list li[data-key="photography"] a').then(()=>{
      console.log("click")
      done()
    })
  });

  // Current location: #!/posts/trending/photography

  it('Current location should be changed', function (done) {
    return this.app.client.getUrl().then((url) => {
      done();
      expect(url.endsWith('#!/posts/trending/photography')).to.equal(true);

    })
  })

  it('Should clicked tag is selected', function (done) {
    this.app.client.getAttribute('.side-tag-list ul.tag-list li[data-key="photography"]', 'class').then(c => {
      expect(c.indexOf('active') !== -1).to.equal(true);
      done();
    })
  });

  it("Should load posts", function (done) {
    this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.elements('.post-list .post-list-item').then(res => {
        expect(res.value.length).to.equal(20);
        done();
      })
    })
  }).timeout(50000);

  it('Should "remove tag" button visible', function (done) {
    this.app.client.isVisible('.side-tag-list .btn-remove-tag').then(v => {
      expect(v).to.equal(true);
      done();
    })
  });

  it('Click remove tag button', function () {
    this.app.client.click('.side-tag-list .btn-remove-tag');
  });

  // Current location: #!/posts/trending

  it("Should be redirected to trending posts page", function (done) {
    this.app.client.getUrl().then(url => {
      expect(url.endsWith('#!/posts/trending')).to.deep.equal(true);
      done();
    })
  });

  it("Should be posts loaded immediately from nav history", function (done) {
    this.app.client.elements('.post-list .post-list-item').then(res => {
      expect(res.value.length).to.equal(58);
      done();
    })
  });

  it("Should switch to promoted filter", function () {
    this.app.client.click('.navbar li[data-key="PROMOTED"] a');
  });

  // Current location: #!/posts/promoted

  it("Should be redirected to promoted posts page", function (done) {
    this.app.client.getUrl().then(url => {
      expect(url.endsWith('#!/posts/promoted')).to.deep.equal(true);
      done();
    })
  });

  it("Promoted button on the navbar should be selected", function () {
    this.app.client.getAttribute('.navbar li[data-key="PROMOTED"]', 'class').then(c => {
      expect(c.indexOf('active') !== -1).to.deep.equal(true);
    })
  });

  /*
    it("Should X", function (done) {
      setTimeout(function(){
        done()
      }, 20000)
    }).timeout(50000)


  /*

  it("Should load posts", function (done) {
    this.app.client.waitUntil(() => {
      return this.app.client.getAttribute('.post-list', 'class').then(res => {
        return res.indexOf('fetching') === -1;
      });
    }).then(() => {
      return this.app.client.elements('.post-list .post-list-item').then(res => {
        expect(res.value.length).to.equal(20);
        done();
      })
    })
  }).timeout(50000);

it("Should load previous posts when scrolled down ", function () {
  this.timeout(20000);

  return this.app.client.execute('document.getElementById("content-main").scrollTop=3000')
    .then(() => {
      return this.app.client.waitUntil(() => { // Wait for loading post list
        return this.app.client.getAttribute('.post-list', 'class').then(res => {
          return res.indexOf('fetching') === -1;
        });
      });
    })
    .then(() => {
      return this.app.client.elements('.post-list .post-list-item').then(res => {
        expect(res.value.length).to.equal(39);
      })
    })
});

it("Should reload", function () {
  this.timeout(20000);

  return this.app.client.click('.post-list .btn-reload')
    .then(() => {
      return this.app.client.waitUntil(() => {
        return this.app.client.getAttribute('.post-list', 'class').then(res => {
          return res.indexOf('fetching') === -1;
        });
      })
    })
    .then(() => {
      return this.app.client.elements('.post-list .post-list-item').then(res => {
        expect(res.value.length).to.equal(20);
      })
    })
});

it("Click a tag", function () {
  this.timeout(5000);
  return this.app.client.click('.side-tag-list ul.tag-list li[data-key="life"] a');
});

// Current location: #!/posts/promoted/life

it('Should redirected to tag page', function () {
  return this.app.client.getUrl().then(url => {
    expect(url.endsWith('#!/posts/promoted/life')).to.deep.equal(true);
  })
});

it("Should load posts", function () {
  this.timeout(20000);

  return this.app.client.waitUntil(() => {
    return this.app.client.getAttribute('.post-list', 'class').then(res => {
      return res.indexOf('fetching') === -1;
    });
  }).then(() => {
    return this.app.client.elements('.post-list .post-list-item').then(res => {
      expect(res.value.length).to.equal(20);
    })
  })
});


// Select promoted filter from navbar +

// Check promoted selected on navbar +

// Wait until posts loaded +

// Click a tag on left tag list +

// Expect address changed to: #!/posts/promoted/:tag +

// Wait until posts loaded +

// Select comments filter from navbar

// Expect address changed to: #!/posts/comments/:tag

// Wait until posts loaded

// Select new filter from navbar

// Wait until posts loaded

// Click refresh

// Wait until posts loaded
*/
});


