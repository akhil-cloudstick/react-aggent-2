// electron/activityMonitor.js

import { createRequire } from 'node:module';
import { initialActivityCounts, MIN_MOUSE_MOVEMENT_DISTANCE, MOUSE_POLL_INTERVAL_MS } from './constants.js';

// --- ESM Path Helpers ---
const require = createRequire(import.meta.url);
// -----------------------

// Use the newly created 'require' function to safely load native CJS modules
const robot = require('robotjs'); // Mouse Polling (Movement)

// 🚀 FIX FOR CONSTRUCTOR ERROR (Encapsulated)
const GKL_Module = require('node-global-key-listener');
let GlobalKeyListenerConstructor = GKL_Module.GlobalKeyListener || GKL_Module.default?.GlobalKeyListener || GKL_Module.default || GKL_Module;

if (typeof GlobalKeyListenerConstructor !== 'function') {
    // Fallback logic from original file to find the constructor
    for (const key in GKL_Module) {
        const prop = GKL_Module[key];
        if (typeof prop === 'function' && key.charAt(0) === key.charAt(0).toUpperCase()) {
            GlobalKeyListenerConstructor = prop;
            break;
        }
    }
}
// ------------------------------------------


let lastMousePos = { x: 0, y: 0 };
let mouseMovementPoll = null;
let activityCounts = { ...initialActivityCounts };
let isMonitoring = false;

// Initialize the global listener once
const globalKeyListener = new GlobalKeyListenerConstructor();

/**
 * Attaches the global key and click listeners.
 */
const startGlobalActivityListeners = () => {
    // Listener is already attached upon initialization, just need to ensure the logic runs conditionally
    globalKeyListener.addListener((e) => {
        if (!isMonitoring) return;

        // Only process DOWN events
        if (e.state === "DOWN") {
            // Keyboard event
            if (e.name) {
                activityCounts.keyPresses++;
                activityCounts.lastActivityTime = Date.now();
                console.log(`[ACTIVITY LOG] KEY PRESS: ${e.name}. Count: ${activityCounts.keyPresses}`);
            }
            // Mouse event
            else if (e.button) {
                activityCounts.mouseClicks++;
                activityCounts.lastActivityTime = Date.now();
                console.log(`[ACTIVITY LOG] MOUSE CLICK: Button ${e.button}. Count: ${activityCounts.mouseClicks}`);
            }
        }
    });
};

/**
 * Starts continuous polling of the mouse position for movement tracking.
 */
const startMouseMovementPolling = () => {
    if (mouseMovementPoll) return;

    mouseMovementPoll = setInterval(() => {
        const currentPos = robot.getMousePos();
        const distance = Math.abs(currentPos.x - lastMousePos.x) + Math.abs(currentPos.y - lastMousePos.y);

        if (distance > MIN_MOUSE_MOVEMENT_DISTANCE && isMonitoring) {
            activityCounts.mouseMovements++;
            activityCounts.lastActivityTime = Date.now();
            console.log(`[ACTIVITY LOG] Mouse moved! Count: ${activityCounts.mouseMovements}`);
        }

        lastMousePos = currentPos;
    }, MOUSE_POLL_INTERVAL_MS);
};

/**
 * Stops mouse movement polling.
 */
const stopMouseMovementPolling = () => {
    if (mouseMovementPoll) {
        clearInterval(mouseMovementPoll);
        mouseMovementPoll = null;
    }
};

/**
 * Resets the activity counts and activates monitoring.
 */
export const activateMonitoring = () => {
    activityCounts = { ...initialActivityCounts };
    isMonitoring = true;
    startMouseMovementPolling();
};

/**
 * Deactivates monitoring and stops polling.
 */
export const deactivateMonitoring = () => {
    isMonitoring = false;
    stopMouseMovementPolling();
    activityCounts = { ...initialActivityCounts };
};

/**
 * Gets the current counts and resets them for the next period.
 * @returns {object} The activity counts from the last period.
 */
export const getAndResetActivityCounts = () => {
    const countsToSend = { ...activityCounts };
    activityCounts = { ...initialActivityCounts }; // Reset for next interval
    return countsToSend;
};

// Ensure listeners are set up once when the module loads
startGlobalActivityListeners();