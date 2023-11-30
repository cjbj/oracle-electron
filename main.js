// main.js

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const myoracle = require('./src/myoracle.js');

async function doQueryFn () {
  const dt = await myoracle.doDateQuery();
  return dt;
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 500,
    webPreferences: {
      defaultFontFamily: {standard:'Arial'},
      preload: path.join(__dirname, 'src/preload.js')
    }
  });

  ipcMain.on('createAppConnectionPool', async (event, un, pw, cs) => {
    await myoracle.createAppConnectionPool(un, pw, cs);
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(`Electron Oracle Database Demo: ${un}@${cs}`);
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  ipcMain.handle('doQuery', doQueryFn);
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin')
    app.quit();
});
