import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

export function registerScreenshotHandler() {
    const screenshotsDir = 'C:\\erp_screenshots';
    if (!fs.existsSync(screenshotsDir)) {

        try {
            fs.mkdirSync(screenshotsDir, { recursive: true });
            console.log(`Created screenshots directory: ${screenshotsDir}`);
        } catch (error) {
            console.error('❌ Failed to create screenshots directory. Check permissions.', error);
            return;
        }
    }
    ipcMain.on('save-screenshot', (event, { subtaskId, keyActions, mouseActions, base64, timestamp }) => {
        try {
            const base64Data = base64.replace(/^data:image\/png;base64,/, '');
            const safeTimestamp = timestamp.replace(/[:.]/g, '-');
            const fileName = `${subtaskId}_${keyActions}_${mouseActions}_${safeTimestamp}.png`;
            const filePath = path.join(screenshotsDir, fileName);
            fs.writeFileSync(filePath, base64Data, 'base64');
            console.log(`✅ Screenshot saved: ${filePath}`);
        } catch (error) {
            console.error('❌ Failed to save screenshot:', error);
        }
    });
}
