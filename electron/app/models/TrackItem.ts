import { Model } from 'objection';
import { TrackItemType } from '../enums/track-item-type';

export class TrackItem extends Model {
    static tableName = 'TrackItems';

    // from Tockler
    id!: number;
    app!: string;
    taskName!: TrackItemType;
    title!: string;
    url!: string;
    color!: string;
    beginDate!: Date;
    endDate!: Date;

    // from GitStart
    createdAt!: Date;
    updatedAt!: Date;
    userEventId?: string;
    isSummarized?: boolean;
}
