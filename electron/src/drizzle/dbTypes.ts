import type { DbService } from './worker/dbService';
import type { AppSettingService } from './worker/queries/app-setting-service';
import type { SettingsService } from './worker/queries/settings-service';
import type { TrackItemService } from './worker/queries/track-item-service';
import type { TrackItemDb } from './worker/queries/trackItem.db';

export type ServiceMethodArgs<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => any ? A : never;
};

export type ServiceMethodReturn<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => Promise<infer R> ? R : never;
};

export type WorkerServices = TrackItemService & AppSettingService & SettingsService & TrackItemDb & DbService;

export type WorkerActionArgs = ServiceMethodArgs<WorkerServices>;
export type WorkerActionReturns = ServiceMethodReturn<WorkerServices>;
