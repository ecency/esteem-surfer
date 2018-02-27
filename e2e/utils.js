import electron from "electron";
import {Application} from "spectron";

const beforeTest = function () {
  this.timeout(10000);
  this.app = new Application({
    path: electron,
    args: ["."],
    startTimeout: 10000,
    waitTimeout: 10000
  });
  return this.app.start();
};

const afterTest = function () {
  this.timeout(10000);
  if (this.app && this.app.isRunning()) {
    return this.app.stop();
  }
  return undefined;
};

const timeout = ms => new Promise(res => setTimeout(res, ms));

const afterEach = async () => {
  await timeout(200)
};

export default {
  beforeTest,
  afterTest,
  afterEach,
  timeout
};
