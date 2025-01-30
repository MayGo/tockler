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

export const PieChart = ({ items, taskName, width }) => {
    const { chartTheme } = useChartThemeState();

    const groupByField = taskName === 'LogTrackItem' ? 'title' : 'app';

    const pieData = _(items)
        .groupBy(groupByField)
        .map((b) => {
            return b.reduce(sumApp, {
                app: b[0].app,
                title: b[0].title,
                timeDiffInMs: 0,
                color: b[0].color,
            });
        })
        .valueOf();

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
