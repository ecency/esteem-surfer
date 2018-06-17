// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import {app, Menu} from "electron";
import {devMenuTemplate} from "./menu/dev_menu_template";
import {editMenuTemplate} from "./menu/edit_menu_template";
import createWindow from "./helpers/window";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

// Github token to checking repository for updates
import {GH_TOKEN} from "./config";

process.env.GH_TOKEN = GH_TOKEN;

import {autoUpdater} from "electron-updater";

autoUpdater.autoDownload = false;

let mainWindow;

let deepUrl;

const singleInstance = app.makeSingleInstance((argv, workingDirectory) => {
  if (process.platform === 'win32' || process.platform === 'linux') {
    deepUrl = argv.slice(1)
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
  app.quit()
}

const setupWindow = () => {
  setApplicationMenu();

  mainWindow = createWindow("main", {
    width: 1200,
    height: 700,
    minWidth: 1000,
    minHeight: 600
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
  }

  if (env.name === "production") {
    autoUpdater.checkForUpdates();

    // run auto updater to check if is there a new version for each 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, (1000 * 60) * 240);
  }

  // Protocol handler for win32 and linux
  if (process.platform === 'win32' || process.platform === 'linux') {
    deepUrl = process.argv.slice(1)
  }

  if (deepUrl) {
    setTimeout(() => {
      sendProtocolUrl2Window(deepUrl);
    }, 4000)
  }
};

app.on('ready', setupWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.setAsDefaultProtocolClient('steem');
app.setAsDefaultProtocolClient('esteem');


app.on('activate', function () {
  if (mainWindow === null) {
    setupWindow()
  }
});

app.on('open-url', function (event, url) {
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

const sendProtocolUrl2Window = (u) => {
  mainWindow.webContents.executeJavaScript(`protocolHandler('${u}')`);
};

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', info.releaseName);
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

import {ipcMain} from "electron";

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
  mainWindow.webContents.send('download-started');
});

ipcMain.on('update-restart', () => {
  autoUpdater.quitAndInstall();
});

