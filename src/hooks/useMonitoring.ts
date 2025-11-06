import { useState, useEffect, useCallback, useRef } from 'react';
import { saveActivity, syncActivityLogs } from "./activityStorage";
import { useAppDispatch } from "@/store/hooks";


interface ActivityData {
    id: number;
    activityId: number;
    keyActions: number;
    mouseActions: number;
    screenshot: string;
    startTime: string;
    endTime: string;
    subtaskId: number;
    workDiaryID: number;
    taskActivityId: number;
}

const MONITORING_INTERVAL_MS = 250 * 60 * 1;
type StartMonitoringFunc = (id: string, workDiaryID: number, taskActivityId: number,) => void;
type StopMonitoringFunc = (id: string, workDiaryID: number, taskActivityId: number) => void;

export const useMonitoring = (): {
    startMonitoring: StartMonitoringFunc,
    stopMonitoring: StopMonitoringFunc,
    latestLogEntry: ActivityData | null;
} => {
    const dispatch = useAppDispatch(); 
    const [latestLogEntry, setLogEntries] = useState<ActivityData | null>(null);
    const startMonitoring: StartMonitoringFunc = useCallback((subId: string, workDiaryID: number, taskActivityId: number,) => {

        if (subId && window.electron && taskActivityId) {
            window.electron.send('start-monitoring', MONITORING_INTERVAL_MS, subId, workDiaryID, taskActivityId);
        }
    }, []);
    const stopMonitoring = useCallback((subId: string, workDiaryID: number, taskActivityId: number) => {
        if (subId && window.electron && taskActivityId) {
            window.electron.send('stop-monitoring', subId, workDiaryID, taskActivityId);
        }
    }, []);
    useEffect(() => {
        if (!window.electron) return;
        const handler = (data: ActivityData) => {
            console.log("dataaa", data);

            if (data.subtaskId) {
                setLogEntries(data)
                saveActivity(data);
                syncActivityLogs(dispatch);
            }
        };

        const cleanup = window.electron.on('periodic-data', handler);
        return () => cleanup();
    }, []);

    // useEffect(() => {
    //     if (latestLogEntry) {

    //         console.log("📸 Log Entries Changed:", latestLogEntry);
    //     }
    // }, [latestLogEntry]);
    return { startMonitoring, stopMonitoring, latestLogEntry };
};