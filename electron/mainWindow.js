// electron/mainWindow.js

import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from './constants.js';

let win = null; // Global window reference

/**
 * Creates and initializes the main application window.
 * @param {string} currentDir - The directory path for asset loading.
 */
export function createMainWindow(currentDir) {
    if (win) return;

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const { WIDTH, HEIGHT, X_MARGIN, Y_MARGIN } = WINDOW_CONFIG;
    const xPos = screenWidth - WIDTH - X_MARGIN;
    const yPos = screenHeight - HEIGHT - Y_MARGIN;

    win = new BrowserWindow({
        // width: WIDTH,
        // height: HEIGHT,
        // x: xPos,
        // y: yPos,
        frame: true,
        backgroundColor: '#FFFFFF',
        titleBarStyle: 'default',
        icon: path.join(currentDir, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(currentDir, 'preload.js'),
            webSecurity: false
        }
    });

    const startUrl = process.env.ELECTRON_START_URL;
    if (startUrl) {
        win.loadURL(startUrl);
        win.webContents.openDevTools();
    } else {
        const appPath = app.getAppPath();
        const htmlPath = path.join(appPath, 'dist', 'index.html');
        console.log(`Loading production file from: ${htmlPath}`);
        win.loadFile(htmlPath);
    }
}

/**
 * Returns the main window instance.
 * @returns {BrowserWindow | null}
 */
export function getMainWindow() {
    return win;
}