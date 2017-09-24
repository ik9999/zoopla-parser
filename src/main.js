const electron = require('electron');
const electronLocalShortcut = require('electron-localshortcut');
const ipc = require('electron').ipcMain;
const contextMenu = require('electron-context-menu');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname);
}

let mainWindow;

let createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden'
  });
  mainWindow.setMenu(null);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://localhost:3000`);
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`)
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  electronLocalShortcut.register(mainWindow, 'F12', () => {
    mainWindow.webContents.toggleDevTools();
  });
  contextMenu({
    window: mainWindow,
    showInspectElement: false
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
  ipc.on('close', () => {
    mainWindow.close();
  });
  ipc.on('resize', () => {
    if (!mainWindow.isMaximized()) {
      mainWindow.maximize();
    } else {
      mainWindow.unmaximize();
    }
  });
  ipc.on('minimize', () => {
    mainWindow.minimize();
  });
  return mainWindow;
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
