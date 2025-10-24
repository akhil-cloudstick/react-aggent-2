// electron/preload.js (Recommended Update)

const { contextBridge, ipcRenderer } = require('electron');

// Define allowed IPC channels directly in preload for security
const allowedSendChannels = ['start-monitoring', 'stop-monitoring'];
const allowedReceiveChannels = ['periodic-data'];

contextBridge.exposeInMainWorld('electron', {
    // Method to send a message to the Main process
    send: (channel, data) => {
        if (allowedSendChannels.includes(channel)) {
            // Note: Data is optional, so we use `... (data ? [data] : [])` 
            // for channels that might send multiple arguments (like start-monitoring)
            if (channel === 'start-monitoring' && Array.isArray(data)) {
                 ipcRenderer.send(channel, ...data); // Send with multiple args
            } else {
                 ipcRenderer.send(channel, data); // Send with one arg/payload
            }
           
        }
    },
    // Method to listen for a message from the Main process
    on: (channel, func) => {
        if (allowedReceiveChannels.includes(channel)) {
            const safeFunc = (event, ...args) => func(...args);
            ipcRenderer.on(channel, safeFunc);
            return () => ipcRenderer.removeListener(channel, safeFunc);
        }
        // Return a no-op cleanup function for disallowed channels for safety
        return () => {}; 
    }
}); 