import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from './constants.js';

let win = null;
export function createMainWindow(currentDir) {
    if (win) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const { WIDTH, HEIGHT, X_MARGIN, Y_MARGIN } = WINDOW_CONFIG;
    const xPos = screenWidth - WIDTH - X_MARGIN;
    const yPos = screenHeight - HEIGHT - Y_MARGIN;

    win = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        x: xPos,
        y: yPos,
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
        // Development Mode: Works perfectly, loads from Vite server
        win.loadURL(startUrl);
        win.webContents.openDevTools();
    } else {
        // Production Mode: FIX for reliable cross-platform file loading
        
        // 1. In a packaged app, 'currentDir' is 'app-root/electron'.
        // 2. We move '..' up to 'app-root'.
        // 3. We look in 'dist' where electron-builder placed the React bundle.
        const htmlPath = path.join(currentDir, '..', 'dist', 'index.html');
        
        // The previous line replaces: 
        // const appPath = app.getAppPath();
        // const htmlPath = path.join(appPath, 'dist', 'index.html');

        win.loadFile(htmlPath);
        win.webContents.openDevTools();
    }
}

export function getMainWindow() {
    return win;
}