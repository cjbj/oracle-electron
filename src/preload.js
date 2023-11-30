// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  doQuery: () => ipcRenderer.invoke('doQuery'),
  createAppConnectionPool: (un, pw, cs) => ipcRenderer.send('createAppConnectionPool', un, pw, cs)
});
