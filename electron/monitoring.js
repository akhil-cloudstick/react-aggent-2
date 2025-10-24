// electron/monitoring.js

import { ipcMain, desktopCapturer } from 'electron';
import { getAndResetActivityCounts, activateMonitoring, deactivateMonitoring } from './activityMonitor.js';
import { IPC_CHANNELS } from './constants.js';

let monitoringInterval = null;

/**
 * Captures a screenshot of the primary screen.
 * @returns {Promise<string | null>} Base64 encoded PNG image or null on error.
 */
const captureScreen = async () => {
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
    console.log('Captured screenshot');
    return base64Image;
}

/**
 * Sets up the IPC handlers for starting and stopping monitoring.
 */
export function setupMonitoringHandlers() {

    // --- Handler to START Monitoring ---
    ipcMain.on(IPC_CHANNELS.START_MONITORING, (event, intervalMs, subtaskId) => {
        if (monitoringInterval) clearInterval(monitoringInterval);

        activateMonitoring(); // Activate activity counter logic
        console.log(`Monitoring started for Subtask ${subtaskId} every ${intervalMs / 1000} seconds.`);

        // 1. Take the initial screenshot and send data immediately
        captureScreen().then(base64Image => {
            // Get data before setting interval to start with counts from *before* this moment
            const initialCounts = getAndResetActivityCounts(); 

            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, {
                ...initialCounts,
                screenshot: base64Image,
                timestamp: new Date().toISOString(),
                subtaskId: subtaskId,
            });
            // Counts are already reset inside getAndResetActivityCounts
        });

        // 2. Set up the periodic interval
        monitoringInterval = setInterval(async () => {
            const base64Image = await captureScreen();
            const counts = getAndResetActivityCounts(); // Get and reset counts

            // Send the collected data and screenshot to the Renderer (React)
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, {
                ...counts,
                screenshot: base64Image,
                timestamp: new Date().toISOString(),
                subtaskId: subtaskId,
            });

        }, intervalMs);
    });

    // --- Handler to STOP Monitoring ---
    ipcMain.on(IPC_CHANNELS.STOP_MONITORING, () => {
        deactivateMonitoring(); // Deactivate activity counter logic

        // Stop data reporting interval
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }

        console.log('Monitoring stopped.');
    });
}

/**
 * Clears the monitoring interval on application quit.
 */
export function cleanupMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    // Deactivate monitoring state and stop polling in activityMonitor.js
    deactivateMonitoring(); 
}