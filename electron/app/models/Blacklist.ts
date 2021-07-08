import { Model } from 'objection';

export class Blacklist extends Model {
    static tableName = 'Blacklist';

    // standard fields
    id!: number;
    createdAt!: Date;
    updatedAt!: Date;

    // TrackItem fields
    app: string;
    title: string;
    url: string;
}
