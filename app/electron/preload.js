const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe API to the renderer
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
  installUpdate: () => ipcRenderer.send("install-update"),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", () => callback()),
});
