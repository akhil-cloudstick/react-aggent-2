#!/usr/bin/env node

import { app, BrowserWindow, screen, Tray, Menu } from 'electron';
import path from 'path';
// REQUIRED for proper path handling in ES Modules:
import { fileURLToPath } from 'url';

// --- ESM Path Helpers ---
const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
// -----------------------

let win; // Keep a global reference to the window
let tray; // Keep a global reference to the tray

function createWindow() {
    // 1. Get the primary display information
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const xMargin = 10;
    const yMargin = 50;
    const windowWidth = 350;
    const windowHeight = 530;
    const xPos = screenWidth - windowWidth - xMargin;
    const yPos = screenHeight - windowHeight - yMargin;

    win = new BrowserWindow({ // Assign to global win variable
        width: windowWidth,
        height: windowHeight,
        x: xPos,
        y: yPos,
        // 🚀 REQUESTED SETTING: Show the native title bar (min/max/close buttons)
        frame: true,
        // 🚀 REQUESTED SETTING: Set background to white
        backgroundColor: '#FFFFFF',
        titleBarStyle: 'default',
        // Use a generic icon path, assuming icon.png/ico is correctly packaged
        icon: path.join(currentDir, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(currentDir, 'preload.js'),
            webSecurity: false
        }
    });

    // Load index.html from root
    const startUrl = process.env.ELECTRON_START_URL;

    if (startUrl) {
        win.loadURL(startUrl);
        // ❌ REMOVED: Automatic DevTools opening in development mode
        // win.webContents.openDevTools(); 
    } else {
        const appPath = app.getAppPath();
        const htmlPath = path.join(appPath, 'dist', 'index.html');

        console.log(`Loading production file from: ${htmlPath}`);

        win.loadFile(htmlPath);
    }


}



// --- Application Lifecycle Events ---

app.whenReady().then(() => {
    createWindow();
    // ❌ FIX: Remove the default Electron application menu bar (File, Edit, etc.)
    app.applicationMenu = null;
});

// 💡 TRAY INTEGRATION: Override default behavior to keep the app running in the background.
app.on('window-all-closed', () => {
    // The app will remain running in the background/system tray.
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
