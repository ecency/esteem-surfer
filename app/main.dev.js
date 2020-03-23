/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

import MenuBuilder from './menu';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

const sendProtocolUrl2Window = u => {
  if (typeof u !== 'string') {
    return false;
  }

  const m = u.match(/e?steem:\/\/[-a-zA-Z0-9@:%._+~#=/]{2,500}/gi);
  if (!m) {
    return false;
  }

  if (m[0]) {
    mainWindow.webContents.executeJavaScript(`protocolHandler('${m[0]}')`);
  }
};

let deepUrl;

const singleInstance = app.makeSingleInstance(argv => {
  if (process.platform === 'win32' || process.platform === 'linux') {
    deepUrl = argv.slice(1);
  }

  if (mainWindow) {
    // if window is open focus and send deepurl
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();

    sendProtocolUrl2Window(deepUrl);
  }
});

if (singleInstance) {
  app.quit();
}

const setupWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 992,
    minHeight: 600
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Auto updater checks
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.autoDownload = false;

    autoUpdater.checkForUpdates();

    // run auto updater to check if is there a new version for each 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 1000 * 60 * 240);
  }

  // Protocol handler for win32 and linux
  if (process.platform === 'win32' || process.platform === 'linux') {
    deepUrl = process.argv.slice(1);
  }

  if (deepUrl) {
    setTimeout(() => {
      sendProtocolUrl2Window(deepUrl);
    }, 4000);
  }

  try {
    const devAdditions = require(`./dev-additions.js`);
    devAdditions(mainWindow);
  } catch (e) {
    console.info('Development additions not found');
  }
};

app.on('ready', setupWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.setAsDefaultProtocolClient('hive');
app.setAsDefaultProtocolClient('esteem');

app.on('activate', () => {
  if (mainWindow === null) {
    setupWindow();
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();

  if (!mainWindow) {
    deepUrl = url;
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();

  sendProtocolUrl2Window(url);
});

// Event handlers for auto updater
autoUpdater.on('update-available', info => {
  mainWindow.webContents.send('update-available', info.releaseName);
});

autoUpdater.on('download-progress', progressObj => {
  mainWindow.webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
  mainWindow.webContents.send('download-started');
});

ipcMain.on('update-restart', () => {
  autoUpdater.quitAndInstall();
  console.log('RESTART');
});
