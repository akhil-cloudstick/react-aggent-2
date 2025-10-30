import { useState, useEffect, useCallback } from 'react';

interface ActivityData {
    keyActions: number;
    mouseActions: number;
    lastActivityTime: number;
    screenshot: string;
    timestamp: string;
    subtaskId: string;
}

const MONITORING_INTERVAL_MS = 1000 * 60 * 1;
type StartMonitoringFunc = (id: string) => void;
type StopMonitoringFunc = (id: string) => void;

export const useMonitoring = (subtaskId: string | undefined): { startMonitoring: StartMonitoringFunc, stopMonitoring: StopMonitoringFunc, latestLogEntry: ActivityData | null } => {
    const [latestLogEntry, setLatestLogEntry] = useState<ActivityData | null>(null);
    const startMonitoring: StartMonitoringFunc = useCallback((id: string) => {
        if (id && window.electron) {
            window.electron.send('start-monitoring', MONITORING_INTERVAL_MS, id);
        }
    }, []);
    const stopMonitoring = useCallback((id: string) => {
        if (id && window.electron) {
            window.electron.send('stop-monitoring', id);
        }
    }, []);
    useEffect(() => {
        if (!window.electron) return;
        const handler = (data: ActivityData) => {
            if (data.subtaskId === subtaskId || data.subtaskId){
                setLatestLogEntry(data);
            if (data.screenshot && window.electron) {
                window.electron.send('save-screenshot', {
                    subtaskId: data.subtaskId,
                    keyActions: data.keyActions,
                    mouseActions: data.mouseActions,
                    base64: data.screenshot,
                    timestamp: data.timestamp
                });
            }
        }
    };
    const cleanup = window.electron.on('periodic-data', handler);
    return () => {
        cleanup();
    };
}, [subtaskId]);
return { startMonitoring, stopMonitoring, latestLogEntry };
};