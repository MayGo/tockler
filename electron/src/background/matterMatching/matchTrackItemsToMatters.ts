import { MatterMatchType } from '../../enums/matter-match-type';
import { dbClient } from '../../drizzle/dbClient';
import { logManager } from '../../utils/log-manager';
import { matchItemToMatter, MatterForMatching } from './matterMatcher.utils';

const logger = logManager.getLogger('matchTrackItemsToMatters');

interface RawMatter {
    id: number;
    caseReference: string;
    keywords: string | null;
    archived: boolean;
}

function toMatterForMatching(matter: RawMatter): MatterForMatching {
    let keywords: string[] = [];
    try {
        keywords = matter.keywords ? JSON.parse(matter.keywords) : [];
    } catch (e) {
        logger.error('Failed to parse keywords for matter', matter.id, e);
    }

    return { id: matter.id, caseReference: matter.caseReference, keywords, archived: matter.archived };
}

export interface MatchTrackItemsOptions {
    // Re-check items that already have a non-manual tag (e.g. after editing matter keywords),
    // instead of only items that have never been processed.
    rematch?: boolean;
    sinceMs?: number;
}

export interface MatchTrackItemsResult {
    processed: number;
    matched: number;
}

export async function matchTrackItemsToMatters(options: MatchTrackItemsOptions = {}): Promise<MatchTrackItemsResult> {
    const { rematch = false, sinceMs = 0 } = options;

    const [rawMatters, pendingItems] = await Promise.all([
        dbClient.findAllMatters(),
        rematch ? dbClient.findTrackItemsForRematch(sinceMs) : dbClient.findTrackItemsPendingMatch(sinceMs),
    ]);

    if (pendingItems.length === 0) {
        return { processed: 0, matched: 0 };
    }

    const candidateMatters = rawMatters.map(toMatterForMatching);

    let matched = 0;

    for (const item of pendingItems) {
        const result = matchItemToMatter(item, candidateMatters);

        if (result) {
            await dbClient.upsertMatterTag(item.id, result.matterId, result.matchedText, result.matchType);
            matched += 1;
        } else {
            await dbClient.upsertMatterTag(item.id, null, null, MatterMatchType.None);
        }
    }

    logger.debug(`Matter matching processed ${pendingItems.length} item(s), matched ${matched}`);

    return { processed: pendingItems.length, matched };
}
