import { logManager } from '../log-manager';
import { Blacklist } from '../models/Blacklist';

export class BlacklistService {
    logger = logManager.getLogger('BlacklistService');

    async createOrUpdateBlacklistItem(
        blacklistItems: Partial<Blacklist>[],
    ): Promise<Partial<Blacklist>[]> {
        const now = new Date();
        let items: Partial<Blacklist>[] = [];
        for (const blacklistAttributes of blacklistItems) {
            if (blacklistAttributes.id) {
                const updates: Partial<Blacklist> = {
                    updatedAt: now,
                    ...blacklistAttributes,
                };
                await Blacklist.query().findById(blacklistAttributes.id).patch(updates);
                items.push(updates);
            } else {
                blacklistAttributes.createdAt = now;
                blacklistAttributes.updatedAt = now;
                items.push(await Blacklist.query().insert(blacklistAttributes));
            }
        }

        return items;
    }

    async getBlacklist(): Promise<Blacklist[]> {
        return await Blacklist.query().orderBy('createdAt', 'ASC');
    }

    async isInBlacklist(blacklistAttributes: Partial<Blacklist>): Promise<boolean> {
        let length = 0;
        length = (
            await Blacklist.query()
                .whereRaw(
                    `(
                        (
                            Blacklist.app IS NULL
                            OR Blacklist.app = ''
                            OR :app LIKE '%' || Blacklist.app || '%'
                        ) 
                        AND (
                            Blacklist.title IS NULL
                            OR Blacklist.title = ''
                            OR :title LIKE '%' || Blacklist.title || '%'
                        ) 
                        AND (
                            Blacklist.url IS NULL
                            OR Blacklist.url = ''
                            OR :url LIKE '%' || Blacklist.url || '%'
                        )
                    )`,
                    {
                        app: blacklistAttributes.app,
                        title: blacklistAttributes.title,
                        url: blacklistAttributes.url,
                    },
                )
                .skipUndefined()
        ).length;

        return length > 0;
    }

    async deleteByIds(ids: number[]) {
        console.log(ids);
        await Blacklist.query().delete().whereIn('id', ids);
        return ids;
    }
}

export const blacklistService = new BlacklistService();
