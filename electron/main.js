// electron/main.js
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function startBackend() {
    const backendPath = path.join(__dirname, '..', 'src', 'jurisconnect-backend', 'src', 'server.js');
    backendProcess = spawn('node', [backendPath], {
        env: { ...process.env, NODE_ENV: 'production' },
        detached: true,
        stdio: 'ignore'
    });
    backendProcess.unref();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    const indexPath = path.join(__dirname, '..', 'src', 'jurisconnect-frontend', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
    if (!app.isPackaged) mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => (mainWindow = null));
}

function buildMenu() {
    const template = [
        { label: 'Arquivo', submenu: [{ role: 'quit', label: 'Sair' }] },
        {
            label: 'Ajuda',
            submenu: [
                {
                    label: 'Sobre',
                    click: () => {
                        dialog.showMessageBox({
                            title: 'Sobre o JurisConnect',
                            message: `JurisConnect Desktop v${app.getVersion()}\n© 2025 JurisConnect Ltd.`,
                            icon: path.join(__dirname, '..', 'assets', 'icon.ico')
                        });
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function initAutoUpdater() {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-downloaded', info => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Atualização disponível',
            message: 'Uma nova versão foi baixada. Deseja reiniciar agora?',
            buttons: ['Reiniciar', 'Depois']
        }).then(ret => {
            if (ret.response === 0) autoUpdater.quitAndInstall();
        });
    });
}

app.on('ready', () => {
    startBackend();
    createWindow();
    buildMenu();
    if (app.isPackaged) initAutoUpdater();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (backendProcess) backendProcess.kill();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
