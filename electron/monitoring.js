import { ipcMain, desktopCapturer, Notification } from 'electron';
import { getAndResetActivityCounts, activateMonitoring, deactivateMonitoring } from './activityMonitor.js';
import { IPC_CHANNELS } from './constants.js';
import { exec } from 'child_process'; // <-- NEW
import fs from 'fs';                 // <-- NEW
import path from 'path';               // <-- NEW
import os from 'os';

let monitoringInterval = null;
let lastEndTime = null;

// const captureScreen = async () => {
//     const sources = await desktopCapturer.getSources({
//         types: ['screen'],
//         thumbnailSize: { width: 1920, height: 1080 }
//     });
//     const primaryScreen = sources.find(source => source.name === 'Entire Screen' || source.id.startsWith('screen:'));
//     if (!primaryScreen) {
//         console.error('Could not find entire screen source.');
//         return null;
//     }
//     const base64Image = primaryScreen.thumbnail.toPNG().toString('base64');
//     showScreenshotNotification();
//     return base64Image;
// }

const captureScreen = () => {
    return new Promise((resolve, reject) => {
        // Define a temporary path for the screenshot file
        const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
        
        // Command to use 'scrot' to take a screenshot and save it to the temp path
        // The '-z' flag is often used to grab the root window, good for full desktop capture.
        const command = `scrot ${tempPath}`; 

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing scrot: ${error.message}. Is 'scrot' installed and running on X11?`);
                // Use resolve(null) to handle failure gracefully in the main monitoring loop
                return resolve(null); 
            }
            
            try {
                // 1. Read the image file buffer
                const imageBuffer = fs.readFileSync(tempPath);
                
                // 2. Convert to base64
                const base64Image = imageBuffer.toString('base64');
                
                // 3. Clean up the temporary file
                fs.unlinkSync(tempPath);

                // Call your notification function (assuming it's defined elsewhere or removed)
                showScreenshotNotification(); 
                
                resolve(base64Image);
            } catch (fsError) {
                console.error(`File system error during screenshot read/cleanup: ${fsError.message}`);
                resolve(null);
            }
        });
    });
};

const showScreenshotNotification = () => {
    const notification = new Notification({
        title: 'Screenshot Captured',
        body: 'A screenshot has been successfully taken.',
        silent: false,
        icon: './icon.ico',
    });

    notification.show();
};


function formatTime(date) {
    return date.toLocaleTimeString('en-GB', { hour12: false });
}


export function setupMonitoringHandlers() {
    ipcMain.on(IPC_CHANNELS.START_MONITORING, (event, intervalMs, subtaskId, workDiaryID, taskActivityId) => {
        if (monitoringInterval) clearInterval(monitoringInterval);
        activateMonitoring();
        console.log(`Monitoring started for Subtask ${subtaskId} every ${intervalMs / 1000} seconds.`);
        const now = new Date();
        lastEndTime = now;
        captureScreen().then(base64Image => {
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                startTime: formatTime(now),
                endTime: formatTime(now),
                subtaskId: subtaskId,
                taskActivityId: taskActivityId,
                workDiaryID: workDiaryID
            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        });
        monitoringInterval = setInterval(async () => {
            const currentTime = new Date();
            const startTime = lastEndTime;
            const endTime = currentTime;
            lastEndTime = endTime; 
            const base64Image = await captureScreen();
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                startTime: formatTime(startTime),
                endTime: formatTime(endTime),
                subtaskId: subtaskId,
                taskActivityId: taskActivityId,
                workDiaryID: workDiaryID
            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        }, intervalMs);
    });

    ipcMain.on(IPC_CHANNELS.STOP_MONITORING, (event, subtaskId, workDiaryID, taskActivityId) => {
        const stopTime = new Date();
        const startTime = lastEndTime;
        captureScreen().then(base64Image => {
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                startTime: formatTime(startTime),
                endTime: formatTime(stopTime),
                subtaskId: subtaskId,
                taskActivityId: taskActivityId,
                workDiaryID: workDiaryID

            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        });
        deactivateMonitoring();
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
        lastEndTime = null;
        console.log('Monitoring stopped.');
    });
}


export function cleanupMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    deactivateMonitoring();
}