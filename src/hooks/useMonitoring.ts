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

// Define the type for the startMonitoring function
type StartMonitoringFunc = (id: string) => void;

export const useMonitoring = (subtaskId: string | undefined): { startMonitoring: StartMonitoringFunc, stopMonitoring: () => void, latestLogEntry: ActivityData | null } => {
    // State to hold the most recently received log entry
    const [latestLogEntry, setLatestLogEntry] = useState<ActivityData | null>(null);

    // Function to initiate monitoring via IPC
    const startMonitoring: StartMonitoringFunc = useCallback((id: string) => { // 1. Function takes 'id'

        if (id && window.electron) {
            window.electron.send('start-monitoring', MONITORING_INTERVAL_MS, id); // Sending as an array for robust handling in preload.js
        }
    }, []); // ⬅️ Corrected dependency array is now empty ([]).

    // Function to halt monitoring via IPC
    const stopMonitoring = useCallback(() => {
        if (window.electron) {
            // Send message to Main process to stop monitoring
            window.electron.send('stop-monitoring');
        }
    }, []);

    // useEffect for setting up the IPC listener still correctly depends on the hook's 'subtaskId'
    useEffect(() => {
        if (!window.electron || !subtaskId) return;

        // Set up the listener for periodic data coming from the Main process
        const handler = (data: ActivityData) => {
            // Only process if the data matches the currently active subtaskId (from hook closure)
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