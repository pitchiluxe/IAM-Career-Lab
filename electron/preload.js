const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
  installUpdate: () => ipcRenderer.send("install-update"),
});

ipcRenderer.on("install-update", () => {
  const { autoUpdater } = require("electron-updater");
  autoUpdater.quitAndInstall();
});
