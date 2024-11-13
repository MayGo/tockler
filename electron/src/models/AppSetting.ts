import { Model } from 'objection';

// TODO: add indexes name
export class AppSetting extends Model {
    static override tableName = 'AppSettings';

    id!: number;
    name!: string;
    color!: string;
}
