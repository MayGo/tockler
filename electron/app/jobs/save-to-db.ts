import moment = require('moment');
import { appConstants } from '../app-constants';
import config from '../config';
import { fetchGraphQLClient, getUserFromToken } from '../graphql';
import { logManager } from '../log-manager';
import { TrackItem } from '../models/TrackItem';
import { logService } from '../services/log-service';
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

export type work_log_approval_status_types_enum =
    | 'approved'
    | 'auto'
    | 'rejected'
    | 'under_review'
    | '%future added value';
export type work_log_meeting_types_enum =
    | 'all_hands'
    | 'client_call'
    | 'daily_standup'
    | 'team_retrospective'
    | 'weekly_demos'
    | '%future added value';
export type work_log_status_types_enum =
    | 'confirmed'
    | 'locked'
    | 'needs_confirmation'
    | '%future added value';
export type work_log_types_enum =
    | 'client'
    | 'client_billed'
    | 'client_project'
    | 'learning'
    | 'meeting'
    | 'other'
    | 'task'
    | 'ticket'
    | '%future added value';
export type user_work_logs_insert_input = {
    approvalStatus?: work_log_approval_status_types_enum | null;
    billableToClient?: boolean | null;
    clientId?: string | null;
    clientProjectId?: number | null;
    createdAt?: string | null;
    deletedAt?: string | null;
    endAt?: string | null;
    id?: number | null;
    meetingType?: work_log_meeting_types_enum | null;
    source?: string | null;
    startAt?: string | null;
    status?: work_log_status_types_enum | null;
    taskId?: number | null;
    technologyId?: number | null;
    ticketId?: number | null;
    updatedAt?: string | null;
    userId?: number | null;
    workDescription?: string | null;
    workType?: work_log_types_enum | null;
};

export class SaveToDbJob {
    token: string | null = null;
    lastSavedUserEventsAt: Date = moment().subtract(14, 'days').toDate();
    lastSavedUserWorklogsAt: Date = moment().subtract(14, 'days').toDate();
    lastSavedSummary: (SummaryItem & { worklogId: number }) | null;

    async run() {
        try {
            // if there is no cached token, check if sqlite Settings table has it.
            if (!this.token) {
                const loginSettings = await settingsService.getLoginSettings();
                if (loginSettings?.token) {
                    this.token = loginSettings.token;
                }
            }

            // save summarized events as user_worklogs
            // DO NOT use this code in a backend service, as it could be highly inneficient -- O(n * o * p * q * r * s * t) ~= O(n^6)
            if (this.token) {
                const events = await TrackItem.query()
                    .whereRaw(
                        `"taskName" = 'AppTrackItem'
                    AND (
                        "isSummarized" = 0
                        OR "updatedAt" >= ?
                    )`,
                        [this.lastSavedUserWorklogsAt],
                    )
                    .limit(100);

                const user = getUserFromToken(this.token);
                if (!user) {
                    // TODO: use refreshToken to get new token instead of setting token to null
                    this.token = null;
                    await settingsService.updateLoginSettings({ token: null });
                    throw new Error('Token Expired!');
                }

                const possibleEntitiesData = await fetchGraphQLClient(
                    process.env.HASURA_GRAPHQL_ENGINE_DOMAIN,
                    {
                        token: this.token,
                    },
                )<PossibleEntities, { after: string }>({
                    operationAction: `
                        query fetchPossibleEntities($after: timestamptz!) {
                            tasks(where: {
                                status: {_nin: [finished, cancelled]}
                                createdAt: {_gte: $after}
                            }) {
                                id
                                ticketCode
                                taskCode
                            }
                            tickets(where: {
                                createdAt: {_gte: $after}
                            }) {
                                id
                                code
                            }
                            projects: client_projects(where: {
                                _or: [
                                    {deletedAt: {_is_null: true}},
                                    {deletedAt: {_gte: "now()"}}
                                ]
                            }) {
                                id
                                name
                            }
                            clients(where: {
                                _or: [
                                    {churnedAt: {_is_null: true}},
                                    {churnedAt: {_gte: "now()"}},
                                ]
                            }) {
                                id
                                name
                            }
                        }
                    `,
                    variables: {
                        after: moment().subtract(15, 'days').toJSON(),
                    },
                });

                if ((possibleEntitiesData.errors?.length ?? 0) > 0) {
                    throw new Error(
                        `Error fetching possible entities from GitStart's DB | ${JSON.stringify(
                            possibleEntitiesData.errors,
                        )}`,
                    );
                }

                const chunks = chunkEvents(events, {
                    disableSorting: true,
                    chunkEvery: 300, // chunks every 300 seconds (5 minutes)
                });

                const summary = chunks.reduce<SummaryItem[]>((summary, chunk) => {
                    const summarizedEvents = summarizeEvents(chunk, {
                        threshold: 0.3, // any activity that takes 30% or more of the chunk is considered a possible summarizer of the whole chunk.
                    });
                    const startAt = chunk[0].beginDate;
                    const endAt = chunk[chunk.length - 1].endDate;

                    const mainEntityOfChunk = summarizedEvents
                        .map((event) =>
                            mapKeywordsToEntity(possibleEntitiesData.data, [
                                event.app,
                                event.title,
                            ]),
                        )
                        .sort((a, b) => entityPriority[a.type] - entityPriority[b.type])[0];

                    if (
                        mainEntityOfChunk.type !== 'other' &&
                        mainEntityOfChunk.type !== 'learning'
                    ) {
                        summary.push({
                            ...mainEntityOfChunk,
                            startAt,
                            endAt,
                            duration: moment(endAt).diff(startAt, 'seconds'),
                        });
                    }

                    return summary;
                }, []);

                // group adjacent events in the summary
                let grouppedSummary = new Array<SummaryItem>();
                for (const item of summary) {
                    if (grouppedSummary.length === 0) {
                        grouppedSummary.push(item);
                        continue;
                    }

                    const lastItem = grouppedSummary[grouppedSummary.length - 1];

                    if (item.startAt > moment(lastItem?.endAt).add(5, 'minutes').toDate()) {
                        grouppedSummary.push(item);
                        continue;
                    }

                    if (
                        (item.type === 'task' &&
                            item.type === lastItem.type &&
                            item.id === lastItem.id) ||
                        (item.type === 'ticket' &&
                            item.type === lastItem.type &&
                            item.id === lastItem.id) ||
                        (item.type === 'client_project' &&
                            item.type === lastItem.type &&
                            item.id === lastItem.id) ||
                        (item.type === 'client' &&
                            item.type === lastItem.type &&
                            item.id === lastItem.id)
                    ) {
                        grouppedSummary[grouppedSummary.length - 1] = {
                            ...lastItem,
                            endAt: item.endAt,
                            duration: lastItem.duration + item.duration,
                        };
                    } else {
                        grouppedSummary.push(item);
                    }
                }

                console.log(
                    grouppedSummary.length,
                    "user_work_logs need to be upserted to GitStart's DB",
                );

                if (grouppedSummary.length > 0) {
                    // check if first summary item matches this.lastSavedSummary
                    if (
                        this.lastSavedSummary?.endAt &&
                        grouppedSummary[0].startAt >
                            moment(this.lastSavedSummary.endAt).add(5, 'minutes').toDate()
                    ) {
                        // mutation to update worklog endAt field
                        const returned = await fetchGraphQLClient(
                            process.env.HASURA_GRAPHQL_ENGINE_DOMAIN,
                            {
                                token: this.token,
                            },
                        )<
                            {
                                update_one_user_work_log: {
                                    id: number;
                                } | null;
                            },
                            {
                                worklogId: number;
                                worklogUpdates: {
                                    endAt: string;
                                };
                            }
                        >({
                            operationAction: `
                                mutation UpdateWorklog($worklogId: Int!, $worklogUpdates: user_work_logs_set_input!) {
                                    update_one_user_work_log: update_user_work_logs_by_pk(pk_columns: {id: $worklogId}, _set: $worklogUpdates) {
                                        id
                                    }
                                }
                            `,
                            variables: {
                                worklogId: this.lastSavedSummary.worklogId,
                                worklogUpdates: {
                                    endAt: new Date(grouppedSummary[0].endAt).toJSON(),
                                },
                            },
                        });

                        if ((returned.errors?.length ?? 0) > 0) {
                            throw new Error(
                                `Error updating user worklog | ${JSON.stringify(returned.errors)}`,
                            );
                        }

                        if (grouppedSummary.length === 1) {
                            this.lastSavedSummary = {
                                ...this.lastSavedSummary,
                                endAt: grouppedSummary[0].endAt,
                            };
                        }

                        grouppedSummary.shift();
                    }

                    if (grouppedSummary.length > 0) {
                        // mutation to insert new user_worklogs
                        const update = await fetchGraphQLClient(
                            process.env.HASURA_GRAPHQL_ENGINE_DOMAIN,
                            {
                                token: this.token,
                            },
                        )<
                            {
                                insert_user_work_logs: {
                                    returning: {
                                        id: number;
                                    }[];
                                };
                            },
                            {
                                worklogs: user_work_logs_insert_input[];
                            }
                        >({
                            operationAction: `
                                mutation InsertWorklogs($worklogs: [user_work_logs_insert_input!]!) {
                                    insert_user_work_logs(objects: $worklogs) {
                                        returning {
                                            id
                                        }
                                    }
                                }
                            `,
                            variables: {
                                worklogs: grouppedSummary.map((summary) => ({
                                    startAt: new Date(summary.startAt).toJSON(),
                                    endAt: new Date(summary.endAt).toJSON(),
                                    workDescription:
                                        'This log was added automatically using data from the GitStart DevTime desktop app.',
                                    ...(summary.type === 'task' ? { taskId: summary.id } : {}),
                                    ...(summary.type === 'ticket' ? { ticketId: summary.id } : {}),
                                    ...(summary.type === 'client_project'
                                        ? { clientProjectId: summary.id }
                                        : {}),
                                    ...(summary.type === 'client' ? { clientId: summary.id } : {}),
                                    technologyId: null, // TODO: get technology by extracting the file extension in the window title of VS Code events
                                    workType: summary.type,
                                    userId: user.id,
                                    status: 'confirmed',
                                    approvalStatus: 'auto',
                                    billableToClient: false,
                                    source: 'automatic from GitStart DevTime app',
                                })),
                            },
                        });

                        if ((update.errors?.length ?? 0) > 0) {
                            // ignore the error if we've already added worklogs at those times
                            if (
                                !update.errors.find((error) =>
                                    error.message.includes('UQ_USER_WORK_LOG_NON_OVERLAPPING'),
                                )
                            ) {
                                throw new Error(
                                    `Error inserting user worklog | ${JSON.stringify(
                                        update.errors,
                                    )}`,
                                );
                            }
                        }

                        const returningLength = update.data.insert_user_work_logs.returning.length;
                        this.lastSavedSummary = {
                            ...grouppedSummary[grouppedSummary.length - 1],
                            worklogId:
                                update.data.insert_user_work_logs.returning[returningLength - 1].id,
                        };
                    }
                }

                const eventIds = events.map((event) => event.id);
                await TrackItem.query().whereIn('id', eventIds).patch({
                    updatedAt: new Date(),
                    isSummarized: true,
                });

                console.log('Successfully upserted', grouppedSummary.length, 'user worklogs');
            }

            // ------------------------------------
            // save individual userEvents
            const items = await TrackItem.query()
                .joinRaw(
                    `LEFT JOIN Whitelist
                    ON (
                        (
                            Whitelist.app IS NULL
                            OR Whitelist.app = ''
                            OR TrackItems.app LIKE '%' || Whitelist.app || '%'
                        ) 
                        AND (
                            Whitelist.title IS NULL
                            OR Whitelist.title = ''
                            OR TrackItems.title LIKE '%' || Whitelist.title || '%'
                        ) 
                        AND (
                            Whitelist.url IS NULL
                            OR Whitelist.url = ''
                            OR TrackItems.url LIKE '%' || Whitelist.url || '%'
                        )
                    )`,
                )
                .whereRaw(
                    `"taskName" = 'AppTrackItem'
                    AND Whitelist.id IS NOT NULL
                    AND (
                        "userEventId" IS NULL
                        OR TrackItems."updatedAt" >= ?
                    )`,
                    [this.lastSavedUserEventsAt],
                )
                .limit(100);
            // FIXME: figure out how to do it with proper Knex `where` methods instead of `whereRaw` as it might be more "safe"
            // .where('taskName', 'AppTrackItem')
            // .whereNull('userEventId')
            // .orWhere('updatedAt', '>=', this.lastSavedAt);

            console.log(items.length, `TrackItems need to be upserted to GitStart's DB`);
            // console.log(items);

            if (this.token) {
                const user = getUserFromToken(this.token);
                if (!user) {
                    // TODO: use refreshToken to get new token instead of setting token to null
                    this.token = null;
                    await settingsService.updateLoginSettings({ token: null });
                    throw new Error('Token Expired!');
                }

                const returned = await sendTrackItemsToDB(
                    items,
                    user.id,
                    process.env.HASURA_GRAPHQL_ENGINE_DOMAIN,
                    this.token,
                );

                if ((returned.errors?.length ?? 0) > 0) {
                    throw new Error(JSON.stringify(returned.errors));
                }

                console.log('Successfully saved', items.length, `TrackItems to GitStart's DB`);
                this.lastSavedUserEventsAt = new Date();

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
                console.log('-------------------------');
            } else {
                // wait for user to go through login flow which will add a token in the db.
                console.log('Received no token. Waiting for user to login...');
                console.log('-------------------------');
            }

            const stagingUserId = config.persisted.get('stagingUserId');
            if (!!stagingUserId) {
                console.log(
                    items.length,
                    `TrackItems need to be upserted to GitStart's Staging DB`,
                );
                const returnedFromStaging = await sendTrackItemsToDB(
                    items,
                    stagingUserId,
                    process.env.HASURA_GRAPHQL_STAGING_ENGINE_DOMAIN,
                    this.token,
                    process.env.HASURA_GRAPHQL_STAGING_ENGINE_SECRET, // by providing the admin secret, it ignores the token that is provided
                );
                if ((returnedFromStaging.errors?.length ?? 0) > 0) {
                    console.error('Error saving to staging DB', returnedFromStaging.errors);
                    logService.createOrUpdateLog({
                        type: 'WARNING',
                        message: `Error saving to staging DB`,
                        jsonData: JSON.stringify(returnedFromStaging.errors),
                    });
                } else {
                    console.log(
                        'Successfully saved',
                        items.length,
                        `TrackItems to GitStart's Staging DB`,
                    );
                }
            }
        } catch (e) {
            console.error(e);
            logService
                .createOrUpdateLog({
                    type: 'ERROR',
                    message: e.message,
                    jsonData: e.toString(),
                })
                .catch(console.error);
        }
        console.log('-------------------------');
    }
}

async function sendTrackItemsToDB(
    items: TrackItem[],
    userId: number,
    domain: string,
    token: string,
    secret?: string,
) {
    // HACK: temporary hack to upsert to hasura. Code can be much cleaner by turning this into a class.
    const userEvents = items.map((event) => {
        return {
            ...(event.userEventId ? { id: event.userEventId } : {}),
            userId,
            updatedAt: new Date().toJSON(),
            appName: event.app,
            title: event.title,
            browserUrl: event.url,
            occurredAt: new Date(event.beginDate).toJSON(),
            duration: Math.round(
                (new Date(event.endDate).getTime() - new Date(event.beginDate).getTime()) / 1000,
            ),
            pollInterval: appConstants.TIME_TRACKING_JOB_INTERVAL / 1000, // ms to sec
            eventType: event.url ? user_event_types_enum.browse_url : user_event_types_enum.app_use,
        };
    });
    const returned = await fetchGraphQLClient(domain, {
        token,
        secret,
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
            userEvents,
        },
    });
    return returned;
}

type ChunkEventsOptions = {
    /**
     * Default: 300 seconds (5 minutes)
     */
    chunkEvery?: number;
    /**
     * Determines whether the passed in `events` array don't need to be sorted in chronological order before summarizing.
     * Make this `true` if you already know the events are sorted.
     *
     * Default: false
     */
    disableSorting?: boolean;
};

const chunkEvents = (events: TrackItem[], options?: ChunkEventsOptions) => {
    const { chunkEvery = 300, disableSorting = false } = options;

    if (!disableSorting) {
        events = events.sort((a, b) => {
            if (a.beginDate < b.beginDate) {
                return -1;
            }
            if (a.beginDate > b.beginDate) {
                return 1;
            }
            return 0;
        });
    }

    const chunkMap = new Map<Date, TrackItem[]>();
    let prevBeginDate: Date = null;
    for (const event of events) {
        if (!prevBeginDate) prevBeginDate = event.beginDate;

        const chunk = chunkMap.get(prevBeginDate);

        if (moment(event.endDate).diff(prevBeginDate, 'seconds') <= chunkEvery) {
            if (chunk) {
                chunk.push(event);
            } else {
                chunkMap.set(prevBeginDate, [event]);
            }
        } else {
            prevBeginDate = event.beginDate;
            chunkMap.set(prevBeginDate, [event]);
        }
    }

    return Array.from(chunkMap, ([_, events]) => events);
};

type SummarizeEventsOptions = {
    /**
     * Determines minimum ratio of time of the summarized event to the total amount of time in the `events` array.
     * Anything below that threshold is filtered out of the resulting array.
     * If resulting array is empty (because the threshold is too high), then the resulting array will default to containing the longest event.
     *
     * Default: 0.3
     */
    threshold?: number;
};

type SummarizedEvent = Partial<TrackItem> & {
    duration: number;
};

/**
 * This function summarizes events by tallying events that have the same app and title together, and filtering out any summarizedEvent that is below the threshold (default: 0.3).
 *
 * Make sure the events don't span a whole day as you that would summarize into one singl. To make sure of that use, use chunkEvents() first, which will chunk events every 5 minutes by default.
 */
const summarizeEvents = (events: TrackItem[], options?: SummarizeEventsOptions) => {
    const { threshold = 0.3 } = options;

    let totalTime = 0;
    const summaryMap = new Map<string, SummarizedEvent>();
    for (const event of events) {
        const key = `${event.app} ${event.title}`;
        const currDuration = moment(event.endDate).diff(event.beginDate, 'seconds');
        const summarized = summaryMap.get(key);

        if (summarized) {
            summaryMap.set(key, {
                ...event,
                beginDate: summarized.beginDate,
                endDate: event.endDate,
                duration: summarized.duration + currDuration,
            });
        } else {
            summaryMap.set(key, {
                ...event,
                duration: currDuration,
            });
        }

        totalTime += currDuration;
    }

    const summarizedEvents = new Array<SummarizedEvent>();
    let longestEvent: SummarizedEvent = null;
    for (const summaryEvent of summaryMap.values()) {
        if (summaryEvent.duration / totalTime > threshold) {
            summarizedEvents.push(summaryEvent);
        }
        if (summaryEvent.duration > (longestEvent?.duration ?? 0)) {
            longestEvent = summaryEvent;
        }
    }

    // if threshold is set too high that there are no summarizedEvents, default to giving returning the longestEvent
    if (summarizedEvents.length === 0 && longestEvent) {
        return [longestEvent];
    }

    return summarizedEvents;
};

type PossibleEntities = {
    tasks: {
        id: number;
        ticketCode: string;
        taskCode: string;
    }[];
    tickets: {
        id: number;
        code: string;
    }[];
    projects: {
        id: number;
        name: string;
    }[];
    clients: {
        id: string;
        name: string;
    }[];
};

type EntityType = 'client' | 'client_project' | 'learning' | 'other' | 'task' | 'ticket';

const mapKeywordsToEntity = (possibleEntities: PossibleEntities, keywords: string[]) => {
    let type: EntityType = 'other';
    const includes = (pattern: string) => {
        return new RegExp(pattern, 'gi').test(keywords.join(' ').replace('[Branch:', '')); // removing "[Branch:" from the keywords as that comes from the "Branch In Window Title" VS Code extension and one of the clients is named "Branch"
    };
    for (const task of possibleEntities.tasks) {
        if (includes(task.ticketCode) && includes(task.taskCode)) {
            type = 'task';
            return { type, ...task };
        }
    }
    for (const ticket of possibleEntities.tickets) {
        if (includes(ticket.code)) {
            type = 'ticket';
            return { type, ...ticket };
        }
    }
    for (const project of possibleEntities.projects) {
        if (includes(project.name)) {
            type = 'client_project';
            return { type, ...project };
        }
    }
    for (const client of possibleEntities.clients) {
        if (includes(client.name) || includes(client.id)) {
            type = 'client';
            return { type, ...client };
        }
    }
    if (
        includes('tutorial') ||
        includes('step') ||
        includes('guide') ||
        includes('manual') ||
        includes('doc') ||
        includes('example') ||
        includes('intro') ||
        includes('get started')
    ) {
        type = 'learning';
        return { type };
    }

    return { type };
};

/** Map of entity types to priority number */
const entityPriority: {
    [entityType in EntityType]: number;
} = {
    task: 1,
    ticket: 2,
    client_project: 3,
    client: 4,
    learning: 5,
    other: 6,
};

type SummaryItem = ReturnType<typeof mapKeywordsToEntity> & {
    startAt: Date;
    endAt: Date;
    duration: number;
};

export const saveToDbJob = new SaveToDbJob();
