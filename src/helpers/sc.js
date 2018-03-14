import express from 'express';
import http from 'http'
import {remote} from 'electron';


export const openSCDialog = (successCb, windowCloseCb) => {

  const serverIp = '127.0.0.1';
  const serverPort = 3415;
  const serverAddr = `http://${serverIp}:${serverPort}/`;

  const scAppName = 'esteem-app';
  const scScope = 'vote,comment,comment_delete,comment_options,custom_json,claim_reward_balance';

  const genAuthUrl = () => {
    return `https://v2.steemconnect.com/oauth2/authorize?client_id=${scAppName}&redirect_uri=${ encodeURIComponent(serverAddr)}&scope=${ encodeURIComponent(scScope)}`;
  };

  const BrowserWindow = remote.BrowserWindow;
  const windowSettings = {
    center: true,
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 800,
    maxHeight: 600,
    maximizable: false,
    alwaysOnTop: true
  };

  const expressApp = express();
  const server = http.createServer(expressApp);

  expressApp.get('/', (req, res) => {

      if (req.headers['user-agent'].indexOf('eSteemSurfer') === -1) {
        res.send(400);
        return;
      }

      let accessToken = req.query.access_token;
      let username = req.query.username;
      let expiresIn = req.query.expires_in;

      if (accessToken && username && expiresIn) {
        res.send('<script>window.close(this);</script>');
        successCb(accessToken, username, expiresIn);
      } else {
        let authUrl = genAuthUrl();
        let css = `body{color: #333; padding: 40px 20px 0 20px; text-align:center; font-size: 16px; font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; word-wrap: break-word; line-height: 20px; }`;
        let js = `setTimeout(function(){ window.location.href = '${authUrl}'}, 1000)`;
        let resp = `
          <!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>eSteem Surfer</title>
            <style>${css}</style>
            <script>${js}</script>
          </head>
          <body>You are redirecting to: <a href="${authUrl}">${authUrl}</a> </body>
          </html>`;
        res.send(resp);
      }
    }
  );

  const win = new BrowserWindow(windowSettings);

  server.listen(serverPort, serverIp);
  server.on('listening', function () {
    win.loadURL(serverAddr);
  });

  win.on('closed', () => {
    server.close();
    server.unref();
    windowCloseCb();
  });

};

