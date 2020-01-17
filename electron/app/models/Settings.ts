import { Table, Column, PrimaryKey, Model, AutoIncrement, DataType } from 'sequelize-typescript';

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

    @Column(DataType.STRING)
    get jsonData(): any {
        const val = this.getDataValue('jsonData');
        if (!val) {
            return {};
        }
        try {
            return JSON.parse(val);
        } catch (error) {
            return {};
        }
    }

    set jsonData(value: any) {
        try {
            this.setDataValue('jsonData', JSON.stringify(value));
        } catch (error) {
            this.setDataValue('jsonData', '{}');
        }
    }
}
