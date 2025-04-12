import { dbService } from './worker/dbService';
import { appSettingService } from './worker/queries/app-setting-service';
import { settingsService } from './worker/queries/settings-service';
import { trackItemService } from './worker/queries/track-item-service';
import { trackItemDb } from './worker/queries/trackItem.db';

export type ServiceMethodArgs<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => any ? A : never;
};

export type ServiceMethodReturn<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => Promise<infer R> ? R : never;
};

export type WorkerServices = typeof trackItemService &
    typeof appSettingService &
    typeof settingsService &
    typeof trackItemDb &
    typeof dbService;

export type WorkerActionArgs = ServiceMethodArgs<WorkerServices>;
export type WorkerActionReturns = ServiceMethodReturn<WorkerServices>;
