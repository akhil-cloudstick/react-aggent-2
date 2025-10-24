#!/usr/bin/env node

import { app, BrowserWindow, screen, Tray, Menu, ipcMain, desktopCapturer } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';

// --- ESM Path Helpers ---
const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
// 1. Correctly initialize the require function for CJS modules (like robotjs/key-listener)
const require = createRequire(import.meta.url);
// -----------------------

// Use the newly created 'require' function to safely load native CJS modules
const robot = require('robotjs'); // Mouse Polling (Movement)

// 🚀 FINAL, AGGRESSIVE FIX FOR CONSTRUCTOR ERROR (KEEPING THIS LOGIC FOR STABILITY):
// 1. Require the entire module object
const GKL_Module = require('node-global-key-listener');

/**
 * 2. Assign the constructor. We check EVERY common export path, including nested
 * properties and using a fallback to find any likely constructor function.
 */
let GlobalKeyListenerConstructor =
    GKL_Module.GlobalKeyListener ||
    GKL_Module.default?.GlobalKeyListener ||
    GKL_Module.default ||
    GKL_Module;

// If still not a function or class, iterate through properties to find a candidate constructor.
if (typeof GlobalKeyListenerConstructor !== 'function') {
    console.log("Constructor fallback initiated: Searching module properties.");

    // Check properties of the module object itself
    for (const key in GKL_Module) {
        const prop = GKL_Module[key];
        // Look for a function/class whose name starts with a capital letter (standard constructor naming)
        if (typeof prop === 'function' && key.charAt(0) === key.charAt(0).toUpperCase()) {
            GlobalKeyListenerConstructor = prop;
            console.log(`Constructor found via fallback: ${key}`);
            break;
        }
    }
}

// Final check on the object's default property if the first loop failed (edge case)
if (typeof GlobalKeyListenerConstructor !== 'function' && GKL_Module.default) {
    for (const key in GKL_Module.default) {
        const prop = GKL_Module.default[key];
        if (typeof prop === 'function' && key.charAt(0) === key.charAt(0).toUpperCase()) {
            GlobalKeyListenerConstructor = prop;
            console.log(`Constructor found via fallback (default property): ${key}`);
            break;
        }
    }
}

// ------------------------------------------

let win; // Global window reference
let monitoringInterval = null;
let mouseMovementPoll = null;
let lastMousePos = { x: 0, y: 0 };
let isMonitoring = false; // <-- NEW: Flag to control when counting is active

let activityCounts = {
    keyPresses: 0,
    mouseClicks: 0,
    mouseMovements: 0,
    lastActivityTime: Date.now()
};

// =========================================================================
// 🚀 EVENT LISTENER SETUP (Keys and Clicks)
// =========================================================================

// Initialize the global listener once (safer for native modules)
const globalKeyListener = new GlobalKeyListenerConstructor();

globalKeyListener.addListener((e, down) => {
    // CONDITION ADDED: Only process events if monitoring is active
    if (!isMonitoring) return;

    // Only process DOWN events to avoid double counting
    if (e.state === "DOWN") {

        // Check for Keyboard event (e.name will be defined)
        if (e.name) {
            activityCounts.keyPresses++;
            activityCounts.lastActivityTime = Date.now();
            // Log to confirm activity capture
            console.log(`[ACTIVITY LOG] KEY PRESS: ${e.name}. Count: ${activityCounts.keyPresses}`);
        }

        // Check for Mouse event (e.button will be defined)
        else if (e.button) {
            activityCounts.mouseClicks++;
            activityCounts.lastActivityTime = Date.now();
            // Log to confirm activity capture
            console.log(`[ACTIVITY LOG] MOUSE CLICK: Button ${e.button}. Count: ${activityCounts.mouseClicks}`);
        }
    }
});


// =========================================================================
// 🚀 ROBOTJS POLLING SETUP (Mouse Movement)
// =========================================================================

/**
 * Continuously polls the mouse position and updates mouseMovements count.0
 */
const startMouseMovementPolling = () => {
    // Only start polling if it's not already running
    if (mouseMovementPoll) return;

    // Poll every 500ms
    mouseMovementPoll = setInterval(() => {
        const currentPos = robot.getMousePos();

        // Calculate the distance moved
        const distance = Math.abs(currentPos.x - lastMousePos.x) + Math.abs(currentPos.y - lastMousePos.y);

        // CONDITION ADDED: Only count if mouse moved significantly (> 10 pixels) AND monitoring is active
        if (distance > 10 && isMonitoring) {
            activityCounts.mouseMovements++;
            activityCounts.lastActivityTime = Date.now();
            // Log to confirm activity capture
            console.log(`[ACTIVITY LOG] Mouse moved! New position: (${currentPos.x}, ${currentPos.y}). Count: ${activityCounts.mouseMovements}`);
        }

        lastMousePos = currentPos;
    }, 500);
};


function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const xMargin = 10;
    const yMargin = 50;
    const windowWidth = 350;
    const windowHeight = 530;
    const xPos = screenWidth - windowWidth - xMargin;
    const yPos = screenHeight - windowHeight - yMargin;

    win = new BrowserWindow({
        width: windowWidth, // Commented out to potentially allow standard window sizing
        height: windowHeight,
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
        win.loadURL(startUrl);
        win.webContents.openDevTools();
    } else {
        const appPath = app.getAppPath();
        const htmlPath = path.join(appPath, 'dist', 'index.html');
        console.log(`Loading production file from: ${htmlPath}`);
        win.loadFile(htmlPath);
    }
}

const captureScreen = async () => {
    // ... (Your existing captureScreen function)
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
    });

    const primaryScreen = sources.find(source => source.name === 'Entire Screen' || source.id.startsWith('screen:'));

    if (!primaryScreen) {
        console.error('Could not find entire screen source.');
        return null;
    }
    const base64Image = primaryScreen.thumbnail.toPNG().toString('base64');

    // 👇 The new console.log line 👇
    console.log('Captured screenshot ',);

    return base64Image;
}


// --- Handler to START Monitoring ---
ipcMain.on('start-monitoring', (event, intervalMs, subtaskId) => {
    if (monitoringInterval) clearInterval(monitoringInterval);

    // START mouse polling and ACTIVATE monitoring flag
    startMouseMovementPolling();
    isMonitoring = true;

    // RESET counts on start
    activityCounts = { keyPresses: 0, mouseClicks: 0, mouseMovements: 0, lastActivityTime: Date.now() };

    console.log(`Monitoring started for Subtask ${subtaskId} every ${intervalMs / 1000} seconds.`);

    // 1. Take the initial screenshot and send data immediately
    captureScreen().then(base64Image => {
        event.sender.send('periodic-data', {
            ...activityCounts,
            screenshot: base64Image,
            timestamp: new Date().toISOString(),
            subtaskId: subtaskId,
        });

        // Reset counts after initial send (to start fresh for the first full interval)
        activityCounts = { keyPresses: 0, mouseClicks: 0, mouseMovements: 0, lastActivityTime: Date.now() };
    });

    // 2. Set up the periodic interval
    monitoringInterval = setInterval(async () => {
        const base64Image = await captureScreen();

        // Send the collected data and screenshot to the Renderer (React)
        event.sender.send('periodic-data', {
            ...activityCounts,
            screenshot: base64Image,
            timestamp: new Date().toISOString(),
            subtaskId: subtaskId,
        });

        // Reset counts for the next period
        activityCounts = { keyPresses: 0, mouseClicks: 0, mouseMovements: 0, lastActivityTime: Date.now() };

    }, intervalMs);
});


// --- Handler to STOP Monitoring ---
ipcMain.on('stop-monitoring', () => {
    // DEACTIVATE monitoring flag first
    isMonitoring = false;

    // Stop data reporting interval
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }

    // Stop mouse movement polling
    if (mouseMovementPoll) {
        clearInterval(mouseMovementPoll);
        mouseMovementPoll = null;
    }

    console.log('Monitoring stopped.');
    // RESET counts on stop
    activityCounts = { keyPresses: 0, mouseClicks: 0, mouseMovements: 0, lastActivityTime: Date.now() };
});


// =========================================================================
// --- Application Lifecycle Events ---

app.whenReady().then(() => {
    createWindow();
    app.applicationMenu = null;
    // Removed: startMouseMovementPolling() call here, as it's now controlled by start-monitoring
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Cleanup polling on application exit
app.on('will-quit', () => {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
    // Stop the mouse movement polling interval
    if (mouseMovementPoll) {
        clearInterval(mouseMovementPoll);
    }
});
