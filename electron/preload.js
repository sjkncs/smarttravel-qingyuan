/**
 * Electron Preload Script — exposes safe IPC bridges to renderer
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
  platform: process.platform,
  // Mini window
  openMiniWindow: () => ipcRenderer.send("open-mini-window"),
  closeMini: () => ipcRenderer.send("mini-close"),
  openMainWindow: () => ipcRenderer.send("open-main-window"),
  // File/Image picker
  pickFile: () => ipcRenderer.invoke("pick-file"),
  pickImage: () => ipcRenderer.invoke("pick-image"),
  // External links
  openExternal: (url) => ipcRenderer.send("open-external", url),
  // Settings event listener
  onOpenSettings: (callback) => ipcRenderer.on("open-settings", callback),
});
