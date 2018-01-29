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

import { Popover } from 'antd';

import * as styles from './Timeline.css';
import { TimelineItemEditContainer } from './TimelineItemEditContainer';

interface IProps {
    timerange: any;
    visibleTimerange: any;
    appTrackItems: any;
    statusTrackItems: any;
    logTrackItems: any;
    changeTimerange?: any;
    selectTimelineItem?: any;
    tracker?: any;
    selectedTimelineItem?: any;
}

interface IHocProps {
    intl: ReactIntl.InjectedIntl;
}

type IFullProps = IProps & IHocProps;

const perEventStyle = (event: any) => {
    const color = event.get('color');
    return {
        fill: color,
    };
};

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
    handleSelectionChanged = item => {
        if (item) {
            console.log(item);
            console.log(item.data().get('title'));
        }

        this.props.selectTimelineItem(item);
    };

    createMainRow = (series: any) => (
        <ChartRow height="30">
            <Charts>
                <EventChart
                    series={series}
                    size={65}
                    style={perEventStyle}
                    onSelectionChange={p => this.handleSelectionChanged(p)}
                    label={(e: any) => e.get('title')}
                />
            </Charts>
        </ChartRow>
    );

    renderBrush(props) {
        const {
            timerange,
            visibleTimerange,
            appTrackItems,
            statusTrackItems,
            logTrackItems,
        }: IFullProps = props;

        return (
            <ChartContainer
                timeRange={timerange}
                timeAxisStyle={axisStyle}
                showGrid={true}
                showGridPosition="over"
                format="%H:%M %a"
            >
                <ChartRow debug={false} height="50">
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
            selectedTimelineItem,
        }: IFullProps = this.props;

        if (!timerange) {
            return <div>No data</div>;
        }
        console.log('Have timerange', visibleTimerange);

        return (
            <div className={styles.chartContainer}>
                <div className={styles.mainContainer}>
                    <Popover
                        content={<TimelineItemEditContainer />}
                        visible={!!selectedTimelineItem}
                        trigger="click"
                    >
                        <Resizable>
                            <ChartContainer
                                onBackgroundClick={p => this.handleSelectionChanged(null)}
                                timeRange={visibleTimerange}
                                enablePanZoom={true}
                                showGrid={true}
                                showGridPosition="over"
                                format="%H:%M %a"
                                onTimeRangeChanged={this.handleTimeRangeChange}
                            >
                                {this.createMainRow(appTrackItems)}
                                {this.createMainRow(statusTrackItems)}
                                {this.createMainRow(logTrackItems)}
                            </ChartContainer>
                        </Resizable>
                    </Popover>
                </div>
                <div className={styles.brushContainer}>
                    <Resizable>{this.renderBrush(this.props)}</Resizable>
                </div>
            </div>
        );
    }
}

export const Timeline = TimelineComp;
