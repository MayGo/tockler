export type WorkSettingsI = {
    workDayStartTime: string;
    workDayEndTime: string;
    splitTaskAfterIdlingForMinutes: number;
    hoursToWork: number;
    sessionLength: number;
    minBreakTime: number;
    notificationDuration: number;
    reNotifyInterval: number;
    smallNotificationsEnabled: boolean;
};
