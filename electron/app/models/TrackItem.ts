import { Model } from 'objection';

export class TrackItem extends Model {
    static tableName = 'TrackItems';

    id!: number;
    app!: string;
    taskName!: string;
    title!: string;
    color!: string;
    beginDate!: Date;
    endDate!: Date;
}
