import moment = require('moment');
import { appConstants } from '../app-constants';
import { fetchGraphQLClient, getUserFromToken } from '../graphql';
import { logManager } from '../log-manager';
import { TrackItem } from '../models/TrackItem';
import { settingsService } from '../services/settings-service';
import { trackItemService } from '../services/track-item-service';

let logger = logManager.getLogger('BackgroundJob');

// HACK: temporary hack to upsert to hasura
declare type hasura_uuid = string;
declare type hasura_timestamptz = string;
export enum user_event_types_enum {
    app_use = 'app_use',
    browse_url = 'browse_url',
    end_day = 'end_day',
    file_edit = 'file_edit',
    start_day = 'start_day',
    task_pause = 'task_pause',
    task_resume = 'task_resume',
    ticket_pause = 'ticket_pause',
    ticket_resume = 'ticket_resume',
}
export type user_events_insert_input = {
    appName?: string | null;
    title?: string | null;
    browserUrl?: string | null;
    clientId?: string | null;
    clientProjectId?: number | null;
    createdAt?: hasura_timestamptz | null;
    deletedAt?: hasura_timestamptz | null;
    duration?: number | null;
    eventType?: user_event_types_enum | null;
    filePath?: string | null;
    gitBranchRef?: string | null;
    gitCommitHash?: string | null;
    gitOwner?: string | null;
    gitRelativeFilePath?: string | null;
    gitRepoName?: string | null;
    id?: hasura_uuid | null;
    occurredAt?: hasura_timestamptz | null;
    pollInterval?: number | null;
    taskId?: number | null;
    ticketId?: number | null;
    updatedAt?: hasura_timestamptz | null;
    userId?: number | null;
};

export class SaveToDbJob {
    token: string | null = null;
    lastSavedAt: Date = moment().subtract(14, 'days').toDate();

    async run() {
        try {
            const items = await TrackItem.query()
                .whereRaw(
                    `"taskName" = 'AppTrackItem' AND ("userEventId" IS NULL OR "updatedAt" >= ?)`,
                    [this.lastSavedAt],
                )
                .limit(100);
            // FIXME: figure out how to do it with proper Knex `where` methods instead of `whereRaw`
            // .where('taskName', 'AppTrackItem')
            // .whereNull('userEventId')
            // .orWhere('updatedAt', '>=', this.lastSavedAt);

            console.log(items.length, `TrackItems need to be upserted to GitStart's DB`);
            // console.log(items);

            // if there is no cached token, check if sqlite Settings table has it.
            if (!this.token) {
                const loginSettings = await settingsService.getLoginSettings();
                if (loginSettings?.token) {
                    this.token = loginSettings.token;
                }
            }

            if (!process.env.HASURA_GRAPHQL_ENGINE_SECRET) {
                // return early and wait for user to go through login flow which will add a token in the db.
                if (!this.token) {
                    console.log('Received no token. Returning early...');
                    return;
                }

                const user = getUserFromToken(this.token);
                if (!user) {
                    // TODO: use refreshToken to get new token instead of setting token to null
                    this.token = null;
                    await settingsService.updateLoginSettings({ token: null });
                    throw new Error('Token Expired!');
                }
            }

            // HACK: temporary hack to upsert to hasura.
            const returned = await fetchGraphQLClient(process.env.HASURA_GRAPHQL_ENGINE_DOMAIN, {
                token: this.token,
                secret: process.env.HASURA_GRAPHQL_ENGINE_SECRET,
            })<
                {
                    insert_user_events: {
                        affected_rows: number;
                        returning: { id: hasura_uuid }[];
                    } | null;
                },
                { userEvents: user_events_insert_input[] }
            >({
                operationAction: `
                    mutation upsertUserEvents($userEvents: [user_events_insert_input!]!) {
                        insert_user_events(objects: $userEvents, on_conflict: {
                            constraint: PK_22f49067e87f2c8a3fff76543d1,
                            update_columns: [
                                appName,
                                browserUrl,
                                duration,
                                pollInterval,
                                updatedAt
                            ]
                        }) {
                            affected_rows
                            returning {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    userEvents: items.map((event) => {
                        return {
                            ...(event.userEventId ? { id: event.userEventId } : {}),
                            updatedAt: new Date().toJSON(),
                            appName: event.app,
                            title: event.title,
                            browserUrl: event.url,
                            occurredAt: new Date(event.beginDate).toJSON(),
                            duration: Math.round(
                                (new Date(event.endDate).getTime() -
                                    new Date(event.beginDate).getTime()) /
                                    1000,
                            ),
                            pollInterval: appConstants.TIME_TRACKING_JOB_INTERVAL / 1000, // ms to sec
                            eventType: event.url
                                ? user_event_types_enum.browse_url
                                : user_event_types_enum.app_use,
                        };
                    }),
                },
            });

            if ((returned.errors?.length ?? 0) > 0) {
                throw new Error(JSON.stringify(returned.errors));
            }

            console.log('Successfully saved', items.length, `TrackItems to GitStart's DB`);
            this.lastSavedAt = new Date();

            console.log('-------------------------');

            console.log(
                returned.data.insert_user_events.returning.length,
                'user_events need to be linked',
            );
            await Promise.all(
                returned.data.insert_user_events.returning.map((userEvent, i) => {
                    console.log({ userEventId: userEvent.id }, items[i].app, items[i].title);
                    return trackItemService.updateTrackItem(
                        { userEventId: userEvent.id },
                        items[i].id,
                    );
                }),
            );

            console.log('Successfully linked', items.length, `user_event with its TrackItem`);
        } catch (e) {
            console.error(e);
        }
    }
}

export const saveToDbJob = new SaveToDbJob();
