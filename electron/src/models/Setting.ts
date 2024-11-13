import { Model } from 'objection';

// TODO: remove plural from model name
export class Setting extends Model {
    static override tableName = 'Settings';

    id!: number;
    name!: string;
    jsonData?: string;

    static override jsonAttributes = ['jsonData'];
}
