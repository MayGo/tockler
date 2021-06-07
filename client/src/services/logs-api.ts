import { emit } from 'eiphop';

export async function findAllLogs(from: Date, to?: Date) {
    const data = await emit('findAllLogs', {
        from,
        to,
    });
    return data;
}
