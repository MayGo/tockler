import { DateTime } from 'luxon';
import { IMatter, MatterInput } from '../@types/IMatter';
import { IMatterReviewItem } from '../@types/IMatterReviewItem';
import { Logger } from '../logger';
import { ElectronEventEmitter } from './ElectronEventEmitter';

export function findAllMatters(): Promise<IMatter[]> {
    return ElectronEventEmitter.emit('findAllMatters');
}

export function createMatter(matter: MatterInput): Promise<IMatter> {
    Logger.debug('Creating matter:', matter);
    return ElectronEventEmitter.emit('createMatter', { matter });
}

export function updateMatter(matterId: number, matter: MatterInput): Promise<IMatter> {
    Logger.debug('Updating matter:', matterId, matter);
    return ElectronEventEmitter.emit('updateMatter', { matterId, matter });
}

export function deleteMatter(matterId: number): Promise<number> {
    Logger.debug('Deleting matter:', matterId);
    return ElectronEventEmitter.emit('deleteMatter', { matterId });
}

export function findMatterReviewItems(from: DateTime, to: DateTime): Promise<IMatterReviewItem[]> {
    return ElectronEventEmitter.emit('findMatterReviewItems', { from: from.valueOf(), to: to.valueOf() });
}

export function reassignMatterTag(trackItemId: number, matterId: number | null): Promise<void> {
    Logger.debug('Reassigning matter tag:', trackItemId, matterId);
    return ElectronEventEmitter.emit('reassignMatterTag', { trackItemId, matterId });
}

export function rematchMatters(): Promise<{ processed: number; matched: number }> {
    return ElectronEventEmitter.emit('rematchMatters');
}
