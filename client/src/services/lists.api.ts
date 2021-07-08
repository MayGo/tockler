import { emit } from 'eiphop';

export type ListItem = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    app?: string | null;
    title?: string | null;
    url?: string | null;
};

// whitelist actions
export async function getWhitelist(): Promise<ListItem[]> {
    const data = await emit('getWhitelist');
    return data;
}

export async function upsertWhitelistItems(
    whitelistItems: Partial<ListItem>[],
): Promise<Partial<ListItem>[]> {
    const result = await emit('upsertWhitelistItems', {
        whitelistItems,
    });
    return result;
}

export async function deleteWhitelistItems(ids: number[]): Promise<number[]> {
    const result = await emit('deleteWhitelistItems', {
        ids,
    });
    return result;
}

// blacklist actions
export async function getBlacklist(): Promise<ListItem[]> {
    const data = await emit('getBlacklist');
    return data;
}

export async function upsertBlacklistItems(
    blacklistItems: Partial<ListItem>[],
): Promise<Partial<ListItem>[]> {
    const result = await emit('upsertBlacklistItems', {
        blacklistItems,
    });
    return result;
}

export async function deleteBlacklistItems(ids: number[]): Promise<number[]> {
    const result = await emit('deleteBlacklistItems', {
        ids,
    });
    return result;
}
