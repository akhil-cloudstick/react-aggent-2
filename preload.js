// preload.js (Required for secure communication)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Method to send a message to the Main process
    send: (channel, data) => {
        // We only allow specific channels for security
        if (['start-monitoring', 'stop-monitoring'].includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    // Method to listen for a message from the Main process
    on: (channel, func) => {
        // We only allow specific channels for security
        if (['periodic-data'].includes(channel)) {
            // Wrap the function to provide only the arguments, not the event object
            const safeFunc = (event, ...args) => func(...args);
            ipcRenderer.on(channel, safeFunc);
            // Return a cleanup function
            return () => ipcRenderer.removeListener(channel, safeFunc);
        }
    }
});