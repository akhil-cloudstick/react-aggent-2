// electron/app.js (Main Process Entry Point)

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMainWindow } from './mainWindow.js';
import { setupMonitoringHandlers, cleanupMonitoring } from './monitoring.js';

// --- ESM Path Helpers ---
const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
// -----------------------

// =========================================================================
// --- Application Lifecycle Events ---

app.whenReady().then(() => {
    // 1. Setup window
    createMainWindow(currentDir);

    // 2. Setup IPC handlers for monitoring
    setupMonitoringHandlers();

    // Remove application menu (optional)
    app.applicationMenu = null; 
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow(currentDir);
});

// Cleanup on application exit
app.on('will-quit', () => {
    // Cleanup monitoring intervals and polling
    cleanupMonitoring();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});