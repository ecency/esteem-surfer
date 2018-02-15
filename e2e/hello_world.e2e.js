import {expect} from "chai";
import testUtils from "./utils";

describe("application launch", () => {

  beforeEach(testUtils.beforeEach);
  afterEach(testUtils.afterEach);

  it("should redirect index to trending posts page", function () {
    return this.app.client.getUrl().then(url => {
      expect(url.endsWith('#!/posts/trending')).to.equal(true);
    });
  });

});


