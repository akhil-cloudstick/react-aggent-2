import { ipcMain, desktopCapturer, Notification } from 'electron';
import { getAndResetActivityCounts, activateMonitoring, deactivateMonitoring } from './activityMonitor.js';
import { IPC_CHANNELS } from './constants.js';

let monitoringInterval = null;

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
    showScreenshotNotification();
    return base64Image;
}

const showScreenshotNotification = () => {
    const notification = new Notification({
        title: 'Screenshot Captured',
        body: 'A screenshot has been successfully taken.',
        silent: false,
        icon: './icon.ico',
    });

    notification.show();
};


export function setupMonitoringHandlers() {

    ipcMain.on(IPC_CHANNELS.START_MONITORING, (event, intervalMs, subtaskId) => {
        if (monitoringInterval) clearInterval(monitoringInterval);
        activateMonitoring();
        console.log(`Monitoring started for Subtask ${subtaskId} every ${intervalMs / 1000} seconds.`);
        captureScreen().then(base64Image => {
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                timestamp: new Date().toISOString(),
                subtaskId: subtaskId,
            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        });
        monitoringInterval = setInterval(async () => {
            const base64Image = await captureScreen();
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                timestamp: new Date().toISOString(),
                subtaskId: subtaskId,
            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        }, intervalMs);
    });

    ipcMain.on(IPC_CHANNELS.STOP_MONITORING, (event, subtaskId) => {
        captureScreen().then(base64Image => {
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                timestamp: new Date().toISOString(),
                subtaskId: subtaskId,
            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        });
        deactivateMonitoring();
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
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