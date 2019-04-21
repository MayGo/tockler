import * as React from 'react';

import { VictoryPie, VictoryContainer } from 'victory';
import { chartTheme } from '../Timeline/ChartTheme';
import _ from 'lodash';
import moment from 'moment';
import { PieLabel } from './PieLabel';
import { convertDate } from '../../constants';

const sumApp = (p, c) => {
    return _.extend(p, {
        timeDiffInMs: p.timeDiffInMs + convertDate(c.endDate).diff(convertDate(c.beginDate)),
    });
};

export const WorkProgressChart = ({ items, width, hoursToWork }) => {
    let groupByField = 'app';

    const pieData: Array<any> = _(items)
        .filter(item => item.app === 'ONLINE')
        .groupBy(groupByField)
        .map(b => {
            return b.reduce(sumApp, {
                app: 'Worked',
                timeDiffInMs: 0,
                color: b[0].color,
            });
        })
        .valueOf();

    if (pieData.length) {
        const workDay = moment.duration(Number(hoursToWork), 'hours');

        const workedMs = pieData[0].timeDiffInMs;

        // pauses must be 10% of worked time
        const pausesInHour = 0.1;
        const worked = moment.duration(workedMs);
        const pauses = moment.duration(workedMs * pausesInHour);

        const undone = workDay.subtract(worked).subtract(pauses);

        const undoneItem = {
            app: 'Work to be done',
            title: 'Work to be done',
            timeDiffInMs: undone.asMilliseconds(),
            color: 'lightgray',
        };
        pieData.push(undoneItem);

        const pausesItem = {
            app: 'Pauses',
            title: 'Pauses',
            timeDiffInMs: pauses.asMilliseconds(),
            color: 'gray',
        };
        pieData.push(pausesItem);
    }

    return (
        <VictoryPie
            theme={chartTheme}
            padding={16}
            width={width}
            height={width}
            innerRadius={width / 4}
            containerComponent={<VictoryContainer responsive={false} />}
            style={{
                data: {
                    fill: d => d.color,
                    stroke: d => d.color,
                    strokeWidth: 0.5,
                    fillOpacity: 0.75,
                },
            }}
            labels={d => {
                const dur = moment.duration(d.timeDiffInMs);
                let formattedDuration = dur.format();

                return `${d[groupByField]} [${formattedDuration}]`;
            }}
            labelComponent={<PieLabel width={width} />}
            x="app"
            y="timeDiffInMs"
            data={pieData}
        />
    );
};
