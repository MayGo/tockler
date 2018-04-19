import * as React from 'react';

import {
    VictoryChart,
    VictoryTooltip,
    VictoryBar,
    VictoryAxis,
    VictoryZoomContainer,
} from 'victory';

import moment from 'moment';

import { chartTheme } from './ChartTheme';
import { TrackItemType } from '../../enum/TrackItemType';
import { MainChart } from './Timeline.styles';

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
    chartWidth?: number;
    loading?: boolean;
}

interface IHocProps {}

type IFullProps = IProps & IHocProps;

const getTrackItemOrder = (type: string) => {
    if (type === TrackItemType.AppTrackItem) {
        return 1;
    }
    if (type === TrackItemType.StatusTrackItem) {
        return 2;
    }
    if (type === TrackItemType.LogTrackItem) {
        return 3;
    }
    return 0;
};

class TimelineComp extends React.Component<IFullProps, {}> {
    constructor(props: any) {
        super(props);
        this.state = {};

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
    handleZoom(domain) {
        this.setState({ selectedDomain: domain });
    }
    render() {
        const {
            appTrackItems,
            logTrackItems,
            statusTrackItems,
            timerange,
            visibleTimerange,
            chartWidth,
        }: IFullProps = this.props;

        if (!timerange && !appTrackItems && appTrackItems.length === 0) {
            return <div>No data</div>;
        }
        console.log('Have timerange', visibleTimerange);

        const timelineData = [...logTrackItems, ...statusTrackItems];

        const barWidth = 25;

        return (
            <MainChart>
                <VictoryChart
                    theme={chartTheme}
                    height={100}
                    width={chartWidth}
                    domainPadding={{ x: 35, y: 10 }}
                    padding={{ left: 50, top: 0, bottom: 20 }}
                    scale={{ x: 'time' }}
                    domain={{
                        x: [moment(timerange[0]).toDate(), moment(timerange[1]).toDate()],
                        y: [1, 3],
                    }}
                    containerComponent={
                        <VictoryZoomContainer responsive={false} zoomDimension="x" />
                    }
                >
                    <VictoryAxis
                        dependentAxis={true}
                        tickValues={[1, 2, 3]}
                        tickFormat={['App', 'Status', 'Log']}
                        style={{
                            grid: { strokeWidth: 0 },
                            ticks: { stroke: 'grey', size: 5 },
                        }}
                    />
                    <VictoryAxis />

                    <VictoryBar
                        horizontal={true}
                        style={{
                            data: {
                                width: barWidth,
                                fill: d => d.color,
                                stroke: d => d.color,
                                strokeWidth: 0.5,
                                fillOpacity: 0.75,
                            },
                        }}
                        labels={d => d.title}
                        labelComponent={
                            <VictoryTooltip
                                horizontal={false}
                                style={chartTheme.tooltip.style}
                                cornerRadius={chartTheme.tooltip.cornerRadius}
                                pointerLength={chartTheme.tooltip.pointerLength}
                                flyoutStyle={chartTheme.tooltip.flyoutStyle}
                            />
                        }
                        x={d => getTrackItemOrder(d.taskName)}
                        y={d => moment(d.beginDate).toDate()}
                        y0={d => moment(d.endDate).toDate()}
                        data={timelineData}
                    />
                </VictoryChart>
            </MainChart>
        );
    }
}

export const Timeline = TimelineComp;
