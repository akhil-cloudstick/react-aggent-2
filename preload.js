const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Function to request a screenshot from the main process
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
  
  // Function to request activity counts and reset them
  getActivityCounts: () => ipcRenderer.invoke('get-activity-counts'),
});
