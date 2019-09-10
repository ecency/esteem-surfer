import { remote } from 'electron';

const APP_NAME = 'esteemapp';
const SCOPE =
  'vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance,offline';
const REDIR_URL = 'http://127.0.0.1:3415/';

const windowSettings = {
  center: true,
  width: 800,
  height: 700,
  minWidth: 800,
  minHeight: 700,
  maxWidth: 800,
  maxHeight: 700,
  maximizable: false,
  alwaysOnTop: true,
  webPreferences: {
    nodeIntegration: false
  }
};

const createWindowView = redirectUrl => {
  const content = encodeURIComponent(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <meta charset="UTF-8">
        <style>
        body {
          align-items: center;
          background: #ccc;
          display: flex;
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
          height: 100%;
          justify-content: center;
          left: 0;
          margin: 0;
          padding: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }
        .wrapper {
          width: 90%;
          margin: auto;
          text-align: center;
          word-break: break-word;
        }
        .url {
          color: #357ce6
        }
        </style>
      </head>
      <body>
        <div class="wrapper">You are redirecting to <span class="url">${redirectUrl}</span></div>
        <script>
            setTimeout(()=>{
              window.location.href = '${redirectUrl}';
            }, 2000)
        </script>
      </body>
    </html>
  `);

  return `data:text/html;charset=UTF-8, ${content}`;
};

export const scLogin = () =>
  new Promise((resolve, reject) => {
    const win = new remote.BrowserWindow(windowSettings);
    win.webContents.setUserAgent(`Chrome/77.0.3835.0`);

    const authUrl = `https://steemconnect.com/oauth2/authorize?client_id=${APP_NAME}&redirect_uri=${encodeURIComponent(
      REDIR_URL
    )}&response_type=code&scope=${encodeURIComponent(SCOPE)}`;

    win.loadURL(createWindowView(authUrl));

    const windowInt = setInterval(() => {
      let url;

      try {
        url = win.webContents.getURL();
      } catch (e) {
        clearInterval(windowInt);
        reject(Error('Window is not reachable'));
        return;
      }

      if (url.startsWith(REDIR_URL)) {
        const parsedUrl = new URL(url);

        const rv = {
          code: parsedUrl.searchParams.get('code')
        };

        resolve(rv);

        clearInterval(windowInt);
        win.close();
      }
    }, 200);
  });

const standardScWindow = path =>
  new Promise((resolve, reject) => {
    const win = new remote.BrowserWindow(windowSettings);
    win.webContents.setUserAgent(`Chrome/77.0.3835.0`);

    const authUrl = `https://steemconnect.com/${path}`;

    win.loadURL(createWindowView(authUrl));
    const windowInt = setInterval(async () => {
      let result;
      try {
        result = await win.webContents.executeJavaScript(
          `document.body.innerHTML`,
          true
        );
      } catch (e) {
        clearInterval(windowInt);
        reject(Error('Window is not reachable'));
        return;
      }

      if (result.includes('Your transaction is on the way!')) {
        resolve();
        clearInterval(windowInt);
        win.close();
      }
    }, 200);
  });

export const scAppAuth = () => standardScWindow('authorize/@esteemapp');

export const scAppRevoke = () => standardScWindow('revoke/@esteemapp');

export const scWitnessVote = (account, witness, approve) =>
  standardScWindow(
    `sign/account-witness-vote?account=${account}&witness=${witness}&approve=${approve}`
  );

export const scWitnessProxy = (account, proxy) =>
  standardScWindow(
    `sign/account-witness-proxy?account=${account}&proxy=${proxy}`
  );

export const scTransfer = (from, to, amount, memo) =>
  standardScWindow(
    `sign/transfer?from=${from}&to=${to}&amount=${encodeURIComponent(
      amount
    )}&memo=${encodeURIComponent(memo)}`
  );

export const scTransferToSavings = (from, to, amount, memo) =>
  standardScWindow(
    `sign/transfer-to-savings?from=${from}&to=${to}&amount=${encodeURIComponent(
      amount
    )}&memo=${encodeURIComponent(memo)}`
  );

export const scTransferFromSavings = (from, requestId, to, amount, memo) =>
  standardScWindow(
    `sign/transfer-from-savings?from=${from}&request_id=${encodeURIComponent(
      requestId
    )}&to=${to}&amount=${encodeURIComponent(amount)}&memo=${encodeURIComponent(
      memo
    )}`
  );

export const scTransferToVesting = (from, to, amount) =>
  standardScWindow(
    `sign/transfer-to-vesting?from=${from}&to=${to}&amount=${encodeURIComponent(
      amount
    )}`
  );

export const scDelegateVestingShares = (delegator, delegatee, vestingShares) =>
  standardScWindow(
    `sign/delegate-vesting-shares?delegator=${delegator}&delegatee=${delegatee}&vesting_shares=${encodeURIComponent(
      vestingShares
    )}`
  );

export const scWithdrawVesting = (account, vestingShares) =>
  standardScWindow(
    `sign/withdraw-vesting?account=${account}&vesting_shares=${encodeURIComponent(
      vestingShares
    )}`
  );

export const sctTransferPoint = (account, json) =>
  standardScWindow(
    `sign/custom-json?authority=active&required_auths=%5B%22${account}%22%5D&required_posting_auths=%5B%5D&id=esteem_point_transfer&json=${encodeURIComponent(
      json
    )}`
  );

export const scPromote = (account, json) =>
  standardScWindow(
    `sign/custom-json?authority=active&required_auths=%5B%22${account}%22%5D&required_posting_auths=%5B%5D&id=esteem_promote&json=${encodeURIComponent(
      json
    )}`
  );

export const scBoost = (account, json) =>
  standardScWindow(
    `sign/custom-json?authority=active&required_auths=%5B%22${account}%22%5D&required_posting_auths=%5B%5D&id=esteem_boost&json=${encodeURIComponent(
      json
    )}`
  );

export const scVoteProposal = (account, proposalId, approve) =>
  standardScWindow(
    `sign/update-proposal-votes?account=${account}&proposal_ids=${JSON.stringify(
      [proposalId]
    )}&approve=${approve}`
  );
