import express from 'express';
import http from 'http'


const makeRedirectingContent = (rUrl) => {
  const js = `setTimeout(function(){ window.location.href = '${rUrl}'}, 3000);`;

  const windowCss = `body{
    color: #333; 
    padding: 40px 20px 0 20px; 
    text-align:center; 
    font-size: 16px; 
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; 
    word-wrap: break-word; 
    line-height: 20px; 
  }`;

  return `<!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>eSteem Surfer</title>
            <style>${windowCss}</style>
            <script>${js}</script>
          </head>
          <body>You are redirecting to: <a href="${rUrl}">${rUrl}</a> </body>
          </html>`;
};

export const startHelperServer = () => {
  const serverIp = '127.0.0.1';
  const serverPort = 3415;

  const expressApp = express();
  const server = http.createServer(expressApp);

  expressApp.all('*', function (req, res, next) {
    // Prevent users open web server in browser
    if (req.headers['user-agent'].indexOf('eSteemSurfer') === -1) {
      res.send(400);
    } else {
      next();
    }
  });

  expressApp.get('/', (req, res) => {
    const accessToken = req.query.access_token;
    const username = req.query.username;
    const expiresIn = req.query.expires_in;

    const error = req.query.error;
    const errorDescription = req.query.error_description;

    if (error) {
      res.send(`<html><title>Login Error</title><body>Error: ${error} - ${errorDescription}</body></html>`);
    } else {
      const respObj = {'accessToken': accessToken, 'username': username, 'expiresIn': expiresIn};
      res.send(`<html><title>Login Success</title><body style="display: none">${JSON.stringify(respObj)}</body></html>`);
    }
  });

  expressApp.get('/login', (req, res) => {
      const scAppName = 'esteem-app';
      const scScope = 'vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance';

      const redirUrl = `http://${serverIp}:${serverPort}/`;
      const authUrl = `https://v2.steemconnect.com/oauth2/authorize?client_id=${scAppName}&redirect_uri=${encodeURIComponent(redirUrl)}&scope=${encodeURIComponent(scScope)}`;
      const content = makeRedirectingContent(authUrl);
      res.send(content);
    }
  );

  expressApp.get('/app-auth', (req, res) => {
      const authUrl = `https://steemconnect.com/authorize/@esteemapp`;
      const content = makeRedirectingContent(authUrl);
      res.send(content);
    }
  );

  expressApp.get('/app-revoke', (req, res) => {
      const revokeUrl = `https://steemconnect.com/revoke/@esteemapp`;
      const content = makeRedirectingContent(revokeUrl);
      res.send(content);
    }
  );

  expressApp.get('/transfer', (req, res) => {
      const data = JSON.parse(decodeURIComponent(req.query.data));
      const transferUrl = `https://steemconnect.com/sign/transfer?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&amount=${encodeURIComponent(data.amount)}&memo=${encodeURIComponent(data.memo)}`;
      const content = makeRedirectingContent(transferUrl);
      res.send(content);
    }
  );

  expressApp.get('/transfer-to-savings', (req, res) => {
      const data = JSON.parse(decodeURIComponent(req.query.data));
      const transferUrl = `https://steemconnect.com/sign/transfer-to-savings?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&amount=${encodeURIComponent(data.amount)}&memo=${encodeURIComponent(data.memo)}`;
      const content = makeRedirectingContent(transferUrl);
      res.send(content);
    }
  );

  expressApp.get('/transfer-from-savings', (req, res) => {
      const data = JSON.parse(decodeURIComponent(req.query.data));
      const transferUrl = `https://steemconnect.com/sign/transfer-from-savings?from=${encodeURIComponent(data.from)}&request_id=${encodeURIComponent(data.requestId)}&to=${encodeURIComponent(data.to)}&amount=${encodeURIComponent(data.amount)}&memo=${encodeURIComponent(data.memo)}`;
      const content = makeRedirectingContent(transferUrl);
      res.send(content);
    }
  );

  expressApp.get('/escrow-transfer', (req, res) => {
      const data = JSON.parse(decodeURIComponent(req.query.data));
      const transferUrl = `https://steemconnect.com/sign/escrow-transfer?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&agent=${encodeURIComponent(data.agent)}&escrow_id=${encodeURIComponent(data.escrowId)}&sbd_amount=${encodeURIComponent(data.sbdAmount)}&steem_amount=${encodeURIComponent(data.steemAmount)}&fee=${encodeURIComponent(data.fee)}&ratification_deadline=${encodeURIComponent(data.ratificationDeadline)}&escrow_expiration=${encodeURIComponent(data.escrowExpiration)}&json_meta=${encodeURIComponent(data.jsonMeta)}`;

      const content = makeRedirectingContent(transferUrl);
      res.send(content);
    }
  );

  expressApp.get('/transfer-to-vesting', (req, res) => {
      const data = JSON.parse(decodeURIComponent(req.query.data));
      const transferUrl = `https://steemconnect.com/sign/transfer-to-vesting?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}&amount=${encodeURIComponent(data.amount)}`;
      const content = makeRedirectingContent(transferUrl);
      res.send(content);
    }
  );

  server.listen(serverPort, serverIp);

  server.on('listening', function () {
    console.log('Steem connect server helper started');
  });
};

