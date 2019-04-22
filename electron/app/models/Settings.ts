import { Table, Column, PrimaryKey, Model, AutoIncrement } from 'sequelize-typescript';

@Table({
    timestamps: false,
    indexes: [
        {
            fields: ['name'],
        },
    ],
    tableName: 'Settings',
})
export class Settings extends Model<Settings> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column
    jsonData: string;

    jsonDataParsed;
}
