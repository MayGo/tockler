import * as React from 'react';

import {
    ChartContainer,
    Resizable,
    Charts,
    ChartRow,
    EventChart,
    Brush,
    YAxis,
    AreaChart,
} from 'react-timeseries-charts';

interface IProps {
    timerange: any;
    visibleTimerange: any;
    appTrackItems: any;
    statusTrackItems: any;
    logTrackItems: any;
    changeTimerange?: any;
    tracker?: any;
}

interface IHocProps {
    intl: ReactIntl.InjectedIntl;
}

type IFullProps = IProps & IHocProps;

const createRow = (series: any) => (
    <ChartRow height="30">
        <Charts>
            <EventChart
                series={series}
                size={55}
                style={(event: any) => ({
                    fill: event.get('color'),
                })}
                label={(e: any) => e.get('title')}
            />
        </Charts>
    </ChartRow>
);
const createBrushEventChart = (series: any) => (
    <EventChart
        series={series}
        size={25}
        style={(event: any) => ({
            fill: event.get('color'),
        })}
        label={(e: any) => e.get('title')}
    />
);

const axisStyle = {
    labels: {
        labelColor: 'grey',
        labelWeight: 100,
        labelSize: 11,
    },
    axis: {
        axisColor: 'grey',
        axisWidth: 1,
    },
};

class TimelineComp extends React.Component<IFullProps, IProps> {
    constructor(props: any) {
        super(props);

        this.handleTrackerChanged = this.handleTrackerChanged.bind(this);
        this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
    }

    handleTrackerChanged(tracker: any) {
        this.setState({ tracker });
    }

    handleTimeRangeChange(timerange: any) {
        if (timerange) {
            this.props.changeTimerange(timerange);
        } else {
            console.error('No Timerange to update');
        }
    }

    renderBrush(props) {
        const {
            timerange,
            visibleTimerange,
            appTrackItems,
            statusTrackItems,
            logTrackItems,
        }: IFullProps = props;
        console.error(visibleTimerange);
        return (
            <ChartContainer timeRange={timerange} timeAxisStyle={axisStyle}>
                <ChartRow debug={false} height="30">
                    <Brush
                        timeRange={visibleTimerange}
                        allowSelectionClear
                        onTimeRangeChanged={this.handleTimeRangeChange}
                    />
                    <Charts>{createBrushEventChart(statusTrackItems)}</Charts>
                </ChartRow>
            </ChartContainer>
        );
    }

    render() {
        const {
            timerange,
            visibleTimerange,
            appTrackItems,
            statusTrackItems,
            logTrackItems,
        }: IFullProps = this.props;

        if (!timerange) {
            return <div>No data</div>;
        }
        console.log('Have timerange', visibleTimerange);
        return (
            <div>
                <Resizable>
                    <ChartContainer
                        timeRange={visibleTimerange}
                        enablePanZoom={true}
                        onTimeRangeChanged={this.handleTimeRangeChange}
                    >
                        {createRow(appTrackItems)}
                        {createRow(statusTrackItems)}
                        {createRow(logTrackItems)}
                    </ChartContainer>
                </Resizable>
                <div>
                    <Resizable>{this.renderBrush(this.props)}</Resizable>
                </div>
            </div>
        );
    }
}

export const Timeline = TimelineComp;