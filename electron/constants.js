// electron/constants.js

// --- Global State Structures ---
export const initialActivityCounts = {
    keyPresses: 0,
    mouseClicks: 0,
    mouseMovements: 0,
    lastActivityTime: Date.now()
};

// --- IPC Channel Names ---
export const IPC_CHANNELS = {
    START_MONITORING: 'start-monitoring',
    STOP_MONITORING: 'stop-monitoring',
    PERIODIC_DATA: 'periodic-data',
    // ... other channels
};

// --- RobotJS Polling Config ---
// Minimum pixel distance the mouse must move to count as one 'movement' event
export const MIN_MOUSE_MOVEMENT_DISTANCE = 10;
// Interval for checking mouse position
export const MOUSE_POLL_INTERVAL_MS = 500; 

// --- Window Configuration ---
export const WINDOW_CONFIG = {
    WIDTH: 350,
    HEIGHT: 530,
    X_MARGIN: 10,
    Y_MARGIN: 50,
};