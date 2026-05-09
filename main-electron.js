import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextBridge: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    title: "Management Portal"
  });

  // In production, load the built index.html
  // In development, load localhost:3000
  const isDev = !app.isPackaged;
  
  if (isDev) {
    win.loadURL('http://localhost:3000').catch(() => {
      setTimeout(() => win.loadURL('http://localhost:3000'), 2000);
    });
    win.webContents.openDevTools();
  } else {
    // Production: Load from the local dist folder
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    win.loadFile(indexPath).catch(err => {
      console.error('Failed to load local file:', err);
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
