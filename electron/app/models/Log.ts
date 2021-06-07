import { Model } from 'objection';

/**
 * This Log model will primarily be used to keep track of all errors in the DevTime app.
 * This table can be extended to also keep track of other kinds of logs. Things that don't need to be saved to GitStart's database.
 */
export class Log extends Model {
    static tableName = 'Logs';

    id!: number;
    createdAt!: Date;
    updatedAt!: Date;
    type!: 'ERROR';
    message?: string;
    jsonData?: any;

    static get jsonAttributes() {
        return ['jsonData'];
    }
}
