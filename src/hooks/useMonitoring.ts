import { useState, useEffect, useCallback } from 'react';

// Define the structure of the data received from the Main process
interface ActivityData {
    keyPresses: number;
    mouseClicks: number;
    mouseMovements: number;
    lastActivityTime: number; // Unix timestamp from Main process
    screenshot: string; // Base64 encoded PNG image
    timestamp: string; // ISO string of capture time
    subtaskId: string;
}

// Time interval (1 minute) for periodic capture
const MONITORING_INTERVAL_MS = 1000 * 60 * 1; 

export const useMonitoring = (subtaskId: string | undefined) => {
    // State to hold the most recently received log entry
    const [latestLogEntry, setLatestLogEntry] = useState<ActivityData | null>(null);

    // Function to initiate monitoring via IPC
    const startMonitoring = useCallback(() => {
        if (subtaskId && window.electron) { 
            // Send message to Main process to start monitoring
            window.electron.send('start-monitoring', MONITORING_INTERVAL_MS, subtaskId);
        }
    }, [subtaskId]);

    // Function to halt monitoring via IPC
    const stopMonitoring = useCallback(() => {
        if (window.electron) { 
            // Send message to Main process to stop monitoring
            window.electron.send('stop-monitoring');
        }
    }, []);

    useEffect(() => {
        if (!window.electron || !subtaskId) return;

        // Set up the listener for periodic data coming from the Main process
        const handler = (data: ActivityData) => {
            // Only process if the data matches the currently active subtaskId
            if (data.subtaskId === subtaskId) {                
                // Update state with the received data
                setLatestLogEntry(data);
            }
        };

        const cleanup = window.electron.on('periodic-data', handler);

        // Cleanup the listener when the component unmounts or subtaskId changes
        return () => {
            cleanup(); 
        };
    }, [subtaskId]); 
    
    return { startMonitoring, stopMonitoring, latestLogEntry };
};