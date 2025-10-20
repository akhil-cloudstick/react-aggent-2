// global.d.ts - Defines the custom API exposed by the Electron preload script

interface ElectronAPI {
    // Define the 'send' method signature
    // Arguments: channel name, monitoring interval (optional, defaults to 5 min), subtask ID
    send: (channel: 'start-monitoring' | 'stop-monitoring', intervalMs?: number, subtaskId?: string) => void;
    
    // Define the 'on' method signature
    // Arguments: channel name, callback function
    // Returns: a cleanup function (void function)
    on: (channel: 'periodic-data', func: (data: any) => void) => () => void;
}

// Augment the global Window interface to include our custom 'electron' property
declare global {
    interface Window {
        electron: ElectronAPI;
    }
}

// Ensure this file is treated as a module
export {};