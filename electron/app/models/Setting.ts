import { Model } from 'objection';

// TODO: remove plural from model name
export class Setting extends Model {
    static tableName = 'Settings';

    // from Tockler
    id!: number;
    name!: string;
    jsonData?: any;

    static get jsonAttributes() {
        return ['jsonData'];
    }

    // from GitStart
    token?: string;
}
