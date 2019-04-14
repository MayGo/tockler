import { Table, Column, PrimaryKey, Model, AutoIncrement } from 'sequelize-typescript';

@Table({
    timestamps: false,
    indexes: [
        {
            fields: ['beginDate'],
        },
        {
            fields: ['endDate'],
        },
        {
            fields: ['taskName'],
        },
    ],
    tableName: 'TrackItems',
})
export class TrackItem extends Model<TrackItem> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    app: string;

    @Column
    taskName: string;

    @Column
    title: string;

    @Column
    color: string;

    @Column
    beginDate: Date;

    @Column
    endDate: Date;
}
