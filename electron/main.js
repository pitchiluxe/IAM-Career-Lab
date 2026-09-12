const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow = null;
let nextServer = null;

const isDev = !app.isPackaged;

function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // In dev mode, Next.js dev server is started separately
      resolve("http://localhost:3000");
      return;
    }

    // In production, run the standalone Next.js server
    const serverPath = path.join(
      process.resourcesPath,
      "app",
      ".next",
      "standalone",
      "server.js"
    );

    const env = {
      ...process.env,
      PORT: "3456",
      HOSTNAME: "127.0.0.1",
    };

    nextServer = spawn(process.execPath, [serverPath], {
      env,
      cwd: path.join(process.resourcesPath, "app"),
      stdio: ["ignore", "pipe", "pipe"],
    });

    nextServer.stdout.on("data", (data) => {
      const msg = data.toString();
      console.log("[next]", msg);
      if (msg.includes("Ready") || msg.includes("started")) {
        resolve("http://127.0.0.1:3456");
      }
    });

    nextServer.stderr.on("data", (data) => {
      console.error("[next error]", data.toString());
    });

    // Fallback: resolve after timeout
    setTimeout(() => resolve("http://127.0.0.1:3456"), 5000);
  });
}

function createWindow(serverUrl) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "IAM Career Lab",
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    backgroundColor: "#0b1120",
    show: false,
  });

  // Open directly to the dashboard, skipping the landing page
  mainWindow.loadURL(`${serverUrl}/dashboard`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http") && !url.includes("127.0.0.1") && !url.includes("localhost")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Auto-update
if (!isDev) {
  try {
    const { autoUpdater } = require("electron-updater");
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("update-available", () => {
      console.log("Update available — downloading...");
    });
    autoUpdater.on("update-downloaded", () => {
      console.log("Update downloaded — will install on quit");
      if (mainWindow) {
        mainWindow.webContents.executeJavaScript(
          `if(confirm("A new version is available. Restart to update?")){require('electron').ipcRenderer.send('install-update')}`
        );
      }
    });
    autoUpdater.on("error", (err) => {
      console.error("Auto-update error:", err);
    });

    app.whenReady().then(() => {
      autoUpdater.checkForUpdatesAndNotify();
    });
  } catch (e) {
    console.log("electron-updater not available:", e.message);
  }
}

app.whenReady().then(async () => {
  const serverUrl = await startNextServer();
  createWindow(serverUrl);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(serverUrl);
    }
  });
});

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
