import { Model } from 'objection';

export class Whitelist extends Model {
    static tableName = 'Whitelist';

    // standard fields
    id!: number;
    createdAt!: Date;
    updatedAt!: Date;

    // TrackItem fields
    app: string;
    title: string;
    url: string;
}
