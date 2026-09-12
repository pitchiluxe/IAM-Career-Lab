const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

let mainWindow = null;
let nextServer = null;
let serverReady = false;

const isDev = !app.isPackaged;
const SERVER_PORT = 3456;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;

// ===== Single-window guard =====
function getOrCreateWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return mainWindow;
  }
  return createWindow();
}

// ===== Start Next.js standalone server =====
function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      resolve(SERVER_URL);
      return;
    }

    const serverPath = path.join(
      process.resourcesPath,
      "app",
      ".next",
      "standalone",
      "server.js"
    );

    const fs = require("fs");
    if (!fs.existsSync(serverPath)) {
      console.error("[next] Server not found at:", serverPath);
      reject(new Error(`Server not found: ${serverPath}`));
      return;
    }

    console.log("[next] Starting server:", serverPath);

    nextServer = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        PORT: String(SERVER_PORT),
        HOSTNAME: "127.0.0.1",
        NODE_ENV: "production",
      },
      cwd: path.join(process.resourcesPath, "app"),
      stdio: ["ignore", "pipe", "pipe"],
    });

    nextServer.stdout.on("data", (data) => {
      console.log("[next]", data.toString().trim());
    });

    nextServer.stderr.on("data", (data) => {
      console.error("[next:err]", data.toString().trim());
    });

    nextServer.on("exit", (code) => {
      console.log("[next] Server exited with code", code);
      nextServer = null;
    });

    nextServer.on("error", (err) => {
      console.error("[next] Spawn error:", err);
      nextServer = null;
      reject(err);
    });

    // Poll the health endpoint until the server responds
    let attempts = 0;
    const maxAttempts = 30;
    const healthCheck = setInterval(() => {
      attempts++;
      const req = http.get(`${SERVER_URL}/dashboard`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 308) {
          clearInterval(healthCheck);
          serverReady = true;
          console.log("[next] Server ready after", attempts, "attempts");
          resolve(SERVER_URL);
        }
        res.destroy();
      });

      req.on("error", () => {
        if (attempts >= maxAttempts) {
          clearInterval(healthCheck);
          console.error("[next] Server failed to start after", maxAttempts, "attempts");
          resolve(SERVER_URL); // Resolve anyway so we can show an error page
        }
      });

      req.setTimeout(1000, () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          clearInterval(healthCheck);
          resolve(SERVER_URL);
        }
      });
    }, 500);
  });
}

// ===== Error page HTML =====
function getErrorHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { background: #0b1120; color: #93a4c0; font-family: 'Segoe UI', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  .container { text-align: center; max-width: 500px; padding: 2rem; }
  h1 { color: #fff; font-size: 1.5rem; margin-bottom: 1rem; }
  p { line-height: 1.6; margin-bottom: 1rem; }
  code { background: #1f2d4d; padding: 2px 6px; border-radius: 4px; color: #3478f6; }
  .icon { font-size: 3rem; margin-bottom: 1rem; }
  button { background: #3478f6; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; margin-top: 1rem; }
  button:hover { background: #2563eb; }
</style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>Server Failed to Start</h1>
    <p>The local Next.js server could not be reached. This may be due to a missing build or corrupted installation.</p>
    <p>Try reinstalling the application. If the problem persists, visit the <a href="https://github.com/pitchiluxe/IAM-Career-Lab" style="color:#3478f6">GitHub repository</a> for help.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>`;
}

// ===== Create the main window =====
function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "IAM Career Lab",
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    autoHideMenuBar: true,
    backgroundColor: "#0b1120",
    show: false,
  });

  // ===== CRITICAL: Always deny new windows =====
  // This prevents the infinite window loop. All external links
  // open in the system browser instead.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // Handle navigation to external URLs
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url && !url.startsWith(SERVER_URL) && !url.startsWith("http://localhost:3000")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle load failure — show error page instead of blank window
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("[electron] Load failed:", errorCode, errorDescription);
    if (errorCode === -102 || errorCode === -3) {
      // ERR_CONNECTION_REFUSED or ERR_ABORTED
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getErrorHTML())}`);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

// ===== Auto-update via IPC =====
ipcMain.on("install-update", () => {
  if (!isDev) {
    try {
      const { autoUpdater } = require("electron-updater");
      autoUpdater.quitAndInstall();
    } catch (e) {
      console.error("[update] Failed to install update:", e.message);
    }
  }
});

// ===== Single app.whenReady() handler =====
app.whenReady().then(async () => {
  // Start the Next.js server
  let serverUrl;
  try {
    serverUrl = await startNextServer();
  } catch (err) {
    console.error("[electron] Server start error:", err.message);
    serverUrl = SERVER_URL; // Will trigger error page
  }

  // Create the window and load dashboard
  createWindow();

  if (serverReady) {
    mainWindow.loadURL(`${serverUrl}/dashboard`);
  } else {
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getErrorHTML())}`);
    mainWindow.show();
  }

  // Auto-update check (production only)
  if (!isDev) {
    try {
      const { autoUpdater } = require("electron-updater");
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;

      autoUpdater.on("update-downloaded", () => {
        console.log("[update] Downloaded — will install on quit");
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("update-available");
        }
      });

      autoUpdater.on("error", (err) => {
        console.error("[update] Error:", err.message);
      });

      autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
      console.log("[update] Not available:", e.message);
    }
  }

  // Re-create window on activate (macOS)
  app.on("activate", () => {
    getOrCreateWindow();
  });
});

// ===== App lifecycle =====
app.on("window-all-closed", () => {
  if (nextServer) {
    nextServer.kill();
    nextServer = null;
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (nextServer) {
    nextServer.kill();
    nextServer = null;
  }
});

// Prevent multiple instances of the app
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    getOrCreateWindow();
  });
}
