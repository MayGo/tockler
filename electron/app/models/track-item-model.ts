import * as SequelizeStatic from 'sequelize';
import { Sequelize } from 'sequelize';
import { TrackItemAttributes, TrackItemInstance } from './interfaces/track-item-interface';

export default function(
    sequelize: Sequelize,
): SequelizeStatic.Model<TrackItemInstance, TrackItemAttributes> {
    let TrackItem = sequelize.define<TrackItemInstance, TrackItemAttributes>(
        'TrackItem',
        {
            app: SequelizeStatic.STRING,
            taskName: SequelizeStatic.STRING,
            title: SequelizeStatic.STRING,
            color: SequelizeStatic.STRING,
            beginDate: SequelizeStatic.DATE,
            endDate: {
                type: SequelizeStatic.DATE,
                /* validate: {
        isAfter: function (value) {
          if (this.beginDate > value) {
            throw new Error('BeginDate must be before endDate! ' + this.beginDate + ' - ' + value);
          }
        }
      }*/
            },
        },
        {
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
        },
    );

    return TrackItem;
}
