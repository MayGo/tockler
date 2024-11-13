import { Model } from 'objection';

export class TrackItem extends Model {
    static override tableName = 'TrackItems';

    id!: number;
    app!: string;
    taskName!: string;
    title!: string;
    url!: string;
    color!: string;
    beginDate!: Date;
    endDate!: Date;
}
