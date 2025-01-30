import _ from 'lodash';
import { VictoryContainer, VictoryPie } from 'victory';
import { convertDate } from '../../constants';
import { PieLabel } from './PieLabel';
import { colorProp } from '../charts.utils';
import { useChartThemeState } from '../../routes/ChartThemeProvider';
import { formatDurationInternal } from '../../utils';

const sumApp = (p, c) => {
    return _.extend(p, {
        timeDiffInMs: p.timeDiffInMs + convertDate(c.endDate).diff(convertDate(c.beginDate)),
    });
};

export const WorkProgressChart = ({ items, width, hoursToWork }) => {
    const { chartTheme } = useChartThemeState();
    const groupByField = 'app';

    const pieData: any[] = _(items)
        .filter((item) => item.app === 'ONLINE')
        .groupBy(groupByField)
        .map((b) => {
            return b.reduce(sumApp, {
                app: 'Worked',
                timeDiffInMs: 0,
                color: b[0].color,
            });
        })
        .valueOf();

    if (pieData.length) {
        const workDayMs = hoursToWork * 60 * 60 * 1000;

        const workedMs = pieData[0].timeDiffInMs;

        // pauses must be 10% of worked time
        const pausesInHour = 0.1;
        const pausesMs = workedMs * pausesInHour;

        const undoneMs = workDayMs - workedMs - pausesMs;

        const undoneItem = {
            app: 'Work to be done',
            title: 'Work to be done',
            timeDiffInMs: undoneMs,
            color: 'lightgray',
        };
        pieData.push(undoneItem);

        const pausesItem = {
            app: 'Pauses',
            title: 'Pauses',
            timeDiffInMs: pausesMs,
            color: 'gray',
        };
        pieData.push(pausesItem);
    }

    const style: any = {
        data: {
            fill: colorProp,
            stroke: colorProp,
            strokeWidth: 0.5,
            fillOpacity: 0.75,
        },
    };

    return (
        <VictoryPie
            theme={chartTheme}
            padding={16}
            width={width}
            height={width}
            innerRadius={width / 4}
            containerComponent={<VictoryContainer responsive={false} />}
            style={style}
            labels={({ datum }) => {
                return `${datum[groupByField]} [${formatDurationInternal(datum.timeDiffInMs)}]`;
            }}
            labelComponent={<PieLabel width={width} theme={chartTheme} innerWidth={0} />}
            x="app"
            y="timeDiffInMs"
            data={pieData}
        />
    );
};
