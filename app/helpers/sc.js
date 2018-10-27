import {remote} from "electron";

const APP_NAME = 'esteem-app';
const SCOPE = 'vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance';
const REDIR_URL = 'http://127.0.0.1:3415/';

const windowSettings = {
  center: true,
  width: 800,
  height: 600,
  minWidth: 800,
  minHeight: 600,
  maxWidth: 800,
  maxHeight: 600,
  maximizable: false,
  alwaysOnTop: true,
  webPreferences: {
    nodeIntegration: false,
  }
};


const createWindowView = (redirectUrl) => {

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

export const scLogin = () => (
  new Promise((resolve, reject) => {

    const win = new remote.BrowserWindow(windowSettings);

    const authUrl = `https://v2.steemconnect.com/oauth2/authorize?client_id=${APP_NAME}&redirect_uri=${encodeURIComponent(REDIR_URL)}&scope=${encodeURIComponent(SCOPE)}`;

    win.loadURL(createWindowView(authUrl));

    const windowInt = setInterval(() => {
      let url;

      try {
        url = win.webContents.getURL();
      }
      catch (e) {
        clearInterval(windowInt);
        reject(Error('Window is not reachable'));
        return;
      }

      if (url.startsWith(REDIR_URL)) {
        const parsedUrl = new URL(url);

        const rv = {
          access_token: parsedUrl.searchParams.get('access_token'),
          expires_in: parsedUrl.searchParams.get('expires_in'),
          username: parsedUrl.searchParams.get('username')
        };

        resolve(rv);

        clearInterval(windowInt);
        win.close();
      }
    }, 200);
  })
);

const standardScWindow = (path) => (
  new Promise((resolve, reject) => {
    const win = new remote.BrowserWindow(windowSettings);
    const authUrl = `https://steemconnect.com/${path}`;

    win.loadURL(createWindowView(authUrl));
    const windowInt = setInterval(async () => {
      let result;
      try {
        result = await win.webContents.executeJavaScript(`document.body.innerHTML`, true);
      } catch (e) {
        clearInterval(windowInt);
        reject(Error('Window is not reachable'));
        return;
      }

      if (result.includes('<h2><span>Congratulations</span></h2>')) {
        resolve();
        clearInterval(windowInt);
        win.close();
      }
    }, 200);
  })
);

export const scAppAuth = () => standardScWindow('authorize/@esteemapp');

export const scAppRevoke = () => standardScWindow('revoke/@esteemapp');