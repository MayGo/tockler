import { Model } from 'objection';

// TODO: remove plural from model name
export class Setting extends Model {
    static tableName = 'Settings';

    id!: number;
    name!: string;
    jsonData?: string;

    static get jsonAttributes() {
        return ['jsonData'];
    }
}
