import { logManager } from '../log-manager';
import { Whitelist } from '../models/Whitelist';

export class WhitelistService {
    logger = logManager.getLogger('WhitelistService');

    async createOrUpdateWhitelistItem(
        whitelistAttributes: Partial<Whitelist>,
    ): Promise<Partial<Whitelist>> {
        let item: Partial<Whitelist> = null;
        const now = new Date();

        if (whitelistAttributes.id) {
            const updates: Partial<Whitelist> = {
                updatedAt: now,
                ...whitelistAttributes,
            };
            await Whitelist.query().findById(whitelistAttributes.id).patch(updates);
            item = updates;
        } else {
            whitelistAttributes.createdAt = now;
            whitelistAttributes.updatedAt = now;
            item = await Whitelist.query().insert(whitelistAttributes);
        }

        return item;
    }

    async getWhitelist(): Promise<Whitelist[]> {
        return await Whitelist.query().orderBy('createdAt', 'ASC');
    }

    async isInWhitelist(whitelistAttributes: Partial<Whitelist>) {
        let length = 0;
        length = (
            await Whitelist.query()
                .whereRaw(
                    `(
                        (
                            Whitelist.app IS NULL
                            OR Whitelist.app = ''
                            OR :app LIKE '%' || Whitelist.app || '%'
                        ) 
                        AND (
                            Whitelist.title IS NULL
                            OR Whitelist.title = ''
                            OR :title LIKE '%' || Whitelist.title || '%'
                        ) 
                        AND (
                            Whitelist.url IS NULL
                            OR Whitelist.url = ''
                            OR :url LIKE '%' || Whitelist.url || '%'
                        )
                    )`,
                    {
                        app: whitelistAttributes.app,
                        title: whitelistAttributes.title,
                        url: whitelistAttributes.url,
                    },
                )
                .skipUndefined()
        ).length;

        return length > 0;
    }

    async deleteByIds(ids: number[]) {
        await Whitelist.query().delete().whereIn('id', ids);
        return ids;
    }
}

export const whitelistService = new WhitelistService();
