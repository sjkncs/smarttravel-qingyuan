/**
 * SmartTravel Qingyuan — Electron Main Process
 * Starts Next.js server then opens BrowserWindow at /desktop
 * Features: System tray, mini-window, floating ball
 */

const { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage, dialog, screen } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let mainWindow = null;
let miniWindow = null;
let tray = null;
let nextServer = null;
let isQuitting = false;

// ── Start Next.js server ──────────────────────────────
function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      resolve();
      return;
    }

    const serverPath = path.join(__dirname, "../.next/standalone/server.js");
    nextServer = spawn("node", [serverPath], {
      env: { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1" },
      stdio: "pipe",
    });

    nextServer.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("started server") || msg.includes("Ready")) {
        resolve();
      }
    });

    nextServer.stderr.on("data", (data) => {
      console.error("[Next.js]", data.toString());
    });

    nextServer.on("error", reject);

    setTimeout(() => {
      waitForServer(PORT, 30, resolve, reject);
    }, 1000);
  });
}

function waitForServer(port, retries, resolve, reject) {
  if (retries <= 0) {
    reject(new Error("Next.js server did not start in time"));
    return;
  }
  http
    .get(`http://localhost:${port}/api/stats`, (res) => {
      if (res.statusCode < 500) resolve();
      else setTimeout(() => waitForServer(port, retries - 1, resolve, reject), 1000);
    })
    .on("error", () => {
      setTimeout(() => waitForServer(port, retries - 1, resolve, reject), 1000);
    });
}

// ── Create main window ────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, "../public/favicon.ico"),
    show: false,
  });

  mainWindow.loadURL(`${BASE_URL}/desktop`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Minimize to tray instead of closing
  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

// ── Create mini floating window ───────────────────────
function createMiniWindow() {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.show();
    miniWindow.focus();
    return;
  }

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

  miniWindow = new BrowserWindow({
    width: 420,
    height: 520,
    x: screenW - 440,
    y: screenH - 560,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, "../public/favicon.ico"),
  });

  miniWindow.loadURL(`${BASE_URL}/desktop?mini=1`);

  miniWindow.on("closed", () => {
    miniWindow = null;
  });
}

// ── System tray ───────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, "../public/favicon.ico");
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "打开智游清远",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: "小窗模式",
      click: () => {
        createMiniWindow();
      },
    },
    { type: "separator" },
    {
      label: "设置",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send("open-settings");
        }
      },
    },
    {
      label: "关于智游清远",
      click: () => {
        dialog.showMessageBox({
          type: "info",
          title: "关于智游清远",
          message: "智游清远 v1.0.0",
          detail: "AI驱动的乡村旅游数字化解决方案\n\n功能特性:\n• SSE流式AI对话\n• BM25+TF-IDF混合检索\n• RAG知识库增强\n• 清远5大特色村落\n\n© 2024 SmartTravel Qingyuan Team",
          buttons: ["确定"],
          icon: iconPath,
        });
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        isQuitting = true;
        if (miniWindow && !miniWindow.isDestroyed()) miniWindow.close();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("智游清远 — AI旅游助手");
  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

// ── IPC handlers ──────────────────────────────────────
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on("window-close", () => mainWindow?.close());
ipcMain.handle("window-is-maximized", () => mainWindow?.isMaximized() ?? false);

// Mini window controls
ipcMain.on("mini-close", () => {
  if (miniWindow && !miniWindow.isDestroyed()) miniWindow.close();
});
ipcMain.on("open-main-window", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
  if (miniWindow && !miniWindow.isDestroyed()) miniWindow.close();
});
ipcMain.on("open-mini-window", () => createMiniWindow());

// File/Image picker
ipcMain.handle("pick-file", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "文档", extensions: ["txt", "pdf", "doc", "docx", "md"] },
      { name: "所有文件", extensions: ["*"] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("pick-image", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "图片", extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

// Open external URL
ipcMain.on("open-external", (_, url) => shell.openExternal(url));

// ── App lifecycle ─────────────────────────────────────
app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  try {
    await startNextServer();
  } catch (e) {
    console.error("Failed to start Next.js server:", e);
  }
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Don't quit — keep tray alive
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  if (nextServer) nextServer.kill();
});
