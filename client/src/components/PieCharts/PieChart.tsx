import * as React from 'react';

import { VictoryPie, VictoryContainer } from 'victory';
import { chartTheme } from '../Timeline/ChartTheme';
import _ from 'lodash';
import moment from 'moment';
import { PieLabel } from './PieLabel';

const sumApp = (p, c) => {
    return _.extend(p, {
        timeDiffInMs: p.timeDiffInMs + moment(c.endDate).diff(c.beginDate),
    });
};

interface IProps {
    items: any;
    taskName: string;
    width: number;
}
export class PieChart extends React.Component<IProps, {}> {
    render() {
        let { items, taskName, width } = this.props;
        console.log('PieChart render:', taskName, items);

        let groupByField = taskName === 'LogTrackItem' ? 'title' : 'app';

        const pieData = _(items)
            .groupBy(groupByField)
            .map(b => {
                return b.reduce(sumApp, {
                    app: b[0].app,
                    title: b[0].title,
                    timeDiffInMs: 0,
                    color: b[0].color,
                });
            })
            .valueOf();

        console.log('PieChar render pieData:', pieData);

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
    }
}
