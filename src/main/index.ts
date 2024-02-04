import {app, BrowserWindow, ipcMain} from 'electron';
import {join} from 'path';
import express from 'express';
import {electronApp, optimizer, is} from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import * as path from "node:path";
import {FileUploadService} from "./services/file-upload-service";

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('electron-fiddle', process.execPath,
            [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('electron-fiddle');
}

let mainWindow: BrowserWindow | null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance',
        (event, commandLine, workingDirectory) => {
            console.log('event second-instance', event, commandLine, workingDirectory);
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }
                mainWindow.focus();
                mainWindow.webContents.send('auth:token', 'test');
            }
        });
}

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        minWidth: 1024,
        minHeight: 640,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? {icon} : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
        }
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow?.show();
    });

    mainWindow.webContents.setWindowOpenHandler((_) => {
        return {action: 'allow'};
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow?.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        console.log('loading in packaged mode');
        const webserver = express();
        webserver.use(express.static(join(__dirname, '../renderer')));
        webserver.listen(3000, () => {
            console.log('server loaded');
            mainWindow?.loadURL('http://localhost:3000/index.html');
        });
    }
}


app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron');

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    const fileService = new FileUploadService(ipcMain);
    console.log('created FileUploadService', fileService);

    createWindow();

    mainWindow?.webContents.openDevTools();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
