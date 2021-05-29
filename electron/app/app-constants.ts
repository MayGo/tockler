export default class AppConstants {
    TIME_TRACKING_JOB_INTERVAL: number = 3 * 1000; // 3 seconds
    DB_JOB_INTERVAL: number = 5 * 60 * 1000; // 5 minutes
    IDLE_IN_SECONDS_TO_LOG: number = 60 * 1;
}

export const appConstants = new AppConstants();
