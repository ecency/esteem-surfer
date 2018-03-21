import electron from "electron";
import {Application} from "spectron";
import {homedir} from "os";
import {existsSync, readFileSync} from "fs";
import {join} from "path";


const validateLoginData = (o) => {
  if (o.length !== 3) {
    return 'There should be 3 accounts';
  }

  for (let i of o) {
    if (!i['username']) {
      return `username required for all accounts!`;
    }
  }

  for (let i of ['master', 'posting', 'active', 'owner', 'memo']) {
    if (!o[0][i]) {
      return `'${i}' key required for account 1!`;
    }
  }

  for (let i of ['master']) {
    if (!o[1][i]) {
      return `'${i}' key required for account 2!`;
    }
  }

  for (let i of ['posting']) {
    if (!o[2][i]) {
      return `'${i}' key required for account 3!`;
    }
  }

  return true;
};

const beforeTest = function () {
  this.timeout(10000);
  this.app = new Application({
    path: electron,
    args: ["."],
    startTimeout: 10000,
    waitTimeout: 10000
  });

  let testLoginDataPath = join(homedir(), '/esteem-surfer-test-users.json');
  if (!existsSync(testLoginDataPath)) {
    console.error('\x1b[31m', 'Login data for testing not found!', '\x1b[0m');
    process.exit();
  }

  this.loginData = JSON.parse(readFileSync(testLoginDataPath, 'utf8'));
  let t = validateLoginData(this.loginData);
  if (t !== true) {
    console.error('\x1b[31m', t, '\x1b[0m');
    process.exit();
  }

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


export default {
  beforeTest,
  afterTest,
  timeout
};
