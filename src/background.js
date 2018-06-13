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

let mainWindow;

app.on("ready", () => {
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

  autoUpdater.checkForUpdatesAndNotify();

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 60000)
});

app.on("window-all-closed", () => {
  app.quit();
});

const logUpdateStatus = (text) => {
  mainWindow.webContents.send('update-log', text);
};

const updateReady = () => {
  mainWindow.webContents.send('update-ready');
};

autoUpdater.on('checking-for-updupdate-logate', () => {
  logUpdateStatus('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  logUpdateStatus('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  logUpdateStatus('Update not available.');
});

autoUpdater.on('error', (err) => {
  logUpdateStatus('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  logUpdateStatus(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  updateReady();
});

setTimeout(() => {
  logUpdateStatus('Hello');
}, 4000);


import {ipcMain} from "electron";

ipcMain.on('update-restart', () => {
  autoUpdater.quitAndInstall()
});

