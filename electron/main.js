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

// Debug logging
function log(msg) {
  console.log(`[Electron] ${msg}`);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('electron-log', msg);
  }
}
function logError(msg, err) {
  console.error(`[Electron] ${msg}`, err);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('electron-error', msg + ': ' + (err?.message || err));
  }
}

let mainWindow = null;
let miniWindow = null;
let tray = null;
let nextServer = null;
let isQuitting = false;

// ── Start Next.js server ──────────────────────────────
function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      log("Development mode - skipping embedded server");
      resolve();
      return;
    }

    // Check resources path
    const resourcesPath = process.resourcesPath;
    log(`Resources path: ${resourcesPath}`);
    
    const serverPath = path.join(resourcesPath, ".next/standalone/server.js");
    const standaloneDir = path.join(resourcesPath, ".next/standalone");
    
    log(`Server path: ${serverPath}`);
    log(`Standalone dir: ${standaloneDir}`);
    
    // Check if files exist
    const fs = require('fs');
    if (!fs.existsSync(serverPath)) {
      logError("Server.js not found", new Error(`Path: ${serverPath}`));
      // Try to list what's in resources
      try {
        const files = fs.readdirSync(resourcesPath);
        log(`Resources contains: ${files.join(', ')}`);
      } catch(e) {}
      reject(new Error(`server.js not found at ${serverPath}`));
      return;
    }
    
    log("Starting Next.js server...");
    
    nextServer = spawn("node", [serverPath], {
      env: { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1", NODE_ENV: "production" },
      cwd: standaloneDir,
      stdio: "pipe",
    });

    let started = false;
    
    nextServer.stdout.on("data", (data) => {
      const msg = data.toString();
      log(`[Next.js stdout] ${msg.substring(0, 100)}`);
      if (!started && (msg.includes("started server") || msg.includes("Ready") || msg.includes("✓"))) {
        started = true;
        log("Next.js server started successfully");
        resolve();
      }
    });

    nextServer.stderr.on("data", (data) => {
      const msg = data.toString();
      log(`[Next.js stderr] ${msg.substring(0, 100)}`);
    });

    nextServer.on("error", (err) => {
      logError("Failed to spawn Next.js server", err);
      reject(err);
    });
    
    nextServer.on("exit", (code) => {
      if (code !== 0 && !started) {
        logError(`Next.js server exited with code ${code}`, new Error("Server crashed"));
        if (!started) reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Wait and check
    setTimeout(() => {
      if (!started) {
        log("Checking if server is ready via HTTP...");
        waitForServer(PORT, 30, resolve, reject);
      }
    }, 3000);
  });
}

function waitForServer(port, retries, resolve, reject) {
  if (retries <= 0) {
    logError("Server wait timeout", new Error("Max retries reached"));
    reject(new Error("Next.js server did not start in time"));
    return;
  }
  
  log(`Waiting for server... ${retries} retries left`);
  
  http
    .get(`http://localhost:${port}/`, { timeout: 2000 }, (res) => {
      log(`Server responded with status ${res.statusCode}`);
      if (res.statusCode < 500) {
        resolve();
      } else {
        setTimeout(() => waitForServer(port, retries - 1, resolve, reject), 1000);
      }
    })
    .on("error", (err) => {
      log(`Server not ready yet: ${err.message}`);
      setTimeout(() => waitForServer(port, retries - 1, resolve, reject), 1000);
    })
    .on("timeout", () => {
      log("Server check timeout");
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
      webSecurity: false, // Allow local file access
    },
    icon: path.join(__dirname, "../public/favicon.ico"),
    show: false,
  });
  
  // Show loading state
  mainWindow.once("ready-to-show", () => {
    log("Window ready to show");
    mainWindow.show();
  });
  
  // Handle load errors
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    logError(`Failed to load: ${errorDescription}`, new Error(`Code: ${errorCode}`));
    // Retry after delay
    setTimeout(() => {
      log("Retrying load...");
      mainWindow.loadURL(`${BASE_URL}/desktop`);
    }, 2000);
  });
  
  mainWindow.webContents.on("crashed", () => {
    logError("Window crashed", new Error("Renderer process crashed"));
  });

  mainWindow.loadURL(`${BASE_URL}/desktop`);

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

// Show error dialog
ipcMain.handle("show-error", async (_, title, message) => {
  await dialog.showErrorBox(title, message);
});

// ── Startup mode dialog ──────────────────────────────
async function showStartupDialog() {
  const { response } = await dialog.showMessageBox({
    type: "question",
    title: "智游乡野 — 启动方式",
    message: "欢迎使用智游乡野桌面版",
    detail:
      "请选择您偏好的使用方式：\n\n" +
      "🖥️ 桌面端体验 — 沉浸式全功能窗口，含3D村落建模、地图导航、AI导游等\n\n" +
      "🌐 网页版 — 在默认浏览器中打开，适合多标签浏览\n\n" +
      "⚡ 小窗模式 — 悬浮迷你窗口，边工作边查询旅游信息",
    buttons: ["桌面端体验", "网页版", "小窗模式"],
    defaultId: 0,
    cancelId: -1,
    icon: path.join(__dirname, "../public/favicon.ico"),
  });
  return response; // 0=desktop, 1=browser, 2=mini
}

// ── App lifecycle ─────────────────────────────────────
app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  log("App ready, starting server...");
  
  try {
    await startNextServer();
    log("Server started, showing startup dialog...");
  } catch (e) {
    logError("Failed to start Next.js server", e);
    dialog.showErrorBox("启动错误", `服务器启动失败: ${e.message}\n\n应用将继续尝试连接...`);
  }

  const mode = await showStartupDialog();
  log(`User selected startup mode: ${mode}`);

  if (mode === 1) {
    // Open in default browser and keep tray
    shell.openExternal(`${BASE_URL}/`);
    createTray();
  } else if (mode === 2) {
    // Mini floating window + tray
    createTray();
    createMiniWindow();
  } else {
    // Default: full desktop window + tray
    createWindow();
    createTray();
  }

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
