const isDevelopment = require('electron-is-dev') as boolean;

export default class AppConstants {
    // TODO: Allow user to change this setting within the Settings view in MainAppPage so that they can reduce tockler's energy usage
    TIME_TRACKING_JOB_INTERVAL: number = 3 * 1000; // 3 seconds
    DB_JOB_INTERVAL: number = isDevelopment
        ? process.env.DB_JOB_INTERVAL
            ? parseInt(process.env.DB_JOB_INTERVAL)
            : 10 * 1000 // 10 seconds
        : 5 * 60 * 1000; // 5 minutes
    IDLE_IN_SECONDS_TO_LOG: number = 60 * 1;
    PROTOCOL_NAME: string = 'x-gitstart-devtime';
}

export const appConstants = new AppConstants();
