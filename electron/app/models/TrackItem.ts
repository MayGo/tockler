import { Model } from 'objection';

export class TrackItem extends Model {
    static tableName = 'TrackItems';

    // from Tockler
    id!: number;
    app!: string;
    taskName!: string;
    title!: string;
    url!: string;
    color!: string;
    beginDate!: Date;
    endDate!: Date;

    // from GitStart
    createdAt!: Date;
    updatedAt!: Date;
    userEventId?: number;
}
