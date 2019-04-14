import { Table, Column, PrimaryKey, Model, AutoIncrement } from 'sequelize-typescript';

@Table({
    timestamps: false,
    indexes: [
        {
            fields: ['name'],
        },
    ],
    tableName: 'AppSettings',
})
export class AppSetting extends Model<AppSetting> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string;

    @Column
    color: string;
}
