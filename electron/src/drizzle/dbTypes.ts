import type { DbService } from './worker/dbService';
import type { AppSettingService } from './worker/queries/app-setting-service';
import type { MatterService } from './worker/queries/matter-service';
import type { MatterTagService } from './worker/queries/matter-tag-service';
import type { SettingsService } from './worker/queries/settings-service';
import type { TrackItemService } from './worker/queries/track-item-service';
import type { TrackItemDb } from './worker/queries/trackItem.db';

export type ServiceMethodArgs<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => any ? A : never;
};

export type ServiceMethodReturn<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => Promise<infer R> ? R : never;
};

export type WorkerServices = TrackItemService &
    AppSettingService &
    SettingsService &
    TrackItemDb &
    DbService &
    MatterService &
    MatterTagService;

export type WorkerActionArgs = ServiceMethodArgs<WorkerServices>;
export type WorkerActionReturns = ServiceMethodReturn<WorkerServices>;
