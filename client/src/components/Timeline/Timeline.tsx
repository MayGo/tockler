import * as React from 'react';
import { Box } from 'grid-styled';

import {
    ChartContainer,
    Resizable,
    Charts,
    ChartRow,
    EventChart,
    Brush,
} from 'react-timeseries-charts';

import { Popover, Spin } from 'antd';

import { TimelineItemEditContainer } from './TimelineItemEditContainer';
import { MainChart, BrushChart, Spinner } from './Timeline.styles';

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
    loading?: boolean;
}

interface IHocProps {}

type IFullProps = IProps & IHocProps;

const perEventStyle = (event: any, state: any) => {
    const color = event.get('color');
    switch (state) {
        case 'normal':
            return {
                fill: color,
            };
        case 'hover':
            return {
                fill: color,
                opacity: 0.4,
            };
        case 'selected':
            return {
                fill: color,
            };
        default:
            return {
                fill: color,
            };
    }
};

const createBrushEventChart = (series: any) => (
    <EventChart
        series={series}
        size={45}
        style={(event: any) => ({
            fill: event.get('color'),
        })}
        label={(e: any) => e.get('title')}
    />
);

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
        const { timerange, visibleTimerange, statusTrackItems }: IFullProps = props;

        return (
            <ChartContainer
                timeRange={timerange}
                showGrid={false}
                showGridPosition="over"
                format="%H:%M %a"
            >
                <ChartRow debug={false} height="45">
                    <Brush
                        timeRange={visibleTimerange}
                        allowSelectionClear={true}
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
            loading,
        }: IFullProps = this.props;

        if (!timerange) {
            return <div>No data</div>;
        }
        console.log('Have timerange', visibleTimerange);

        return (
            <Box>
                <MainChart>
                    {loading && (
                        <Spinner>
                            <Spin />
                        </Spinner>
                    )}
                    <Popover
                        style={{ zIndex: 930 }}
                        content={<TimelineItemEditContainer />}
                        visible={!!selectedTimelineItem}
                        trigger="click"
                    >
                        <Resizable>
                            <ChartContainer
                                onBackgroundClick={p => this.handleSelectionChanged(null)}
                                timeRange={visibleTimerange}
                                enablePanZoom={true}
                                showGrid={false}
                                showGridPosition="over"
                                format="%H:%M %a"
                                onTimeRangeChanged={this.handleTimeRangeChange}
                            >
                                {this.createMainRow(logTrackItems)}
                                {this.createMainRow(statusTrackItems)}
                                {this.createMainRow(appTrackItems)}
                            </ChartContainer>
                        </Resizable>
                    </Popover>
                </MainChart>
                <BrushChart>
                    <Resizable>{this.renderBrush(this.props)}</Resizable>
                </BrushChart>
            </Box>
        );
    }
}

export const Timeline = TimelineComp;
