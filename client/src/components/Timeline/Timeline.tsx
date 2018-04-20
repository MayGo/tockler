import * as React from 'react';

import {
    VictoryChart,
    VictoryBrushContainer,
    VictoryBar,
    VictoryAxis,
    VictoryZoomContainer,
} from 'victory';

import { chartTheme } from './ChartTheme';
import { TrackItemType } from '../../enum/TrackItemType';
import { MainChart, BrushChart } from './Timeline.styles';

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
interface IState {
    zoomDomain: any;
    selectedDomain: any;
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

class TimelineComp extends React.Component<IFullProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = { zoomDomain: null, selectedDomain: null };

        // this.handleTrackerChanged = this.handleTrackerChanged.bind(this);
        this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
    }

    /* handleTrackerChanged(tracker: any) {
        this.setState({ tracker });
    }*/

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
    handleBrush(domain) {
        this.setState({ zoomDomain: domain });
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
        console.log(`Rendering ${timelineData.length} items`);
        const barWidth = 25;

        return (
            <div>
                <MainChart>
                    <VictoryChart
                        theme={chartTheme}
                        height={100}
                        width={chartWidth}
                        domainPadding={{ x: 35, y: 10 }}
                        padding={{ left: 50, top: 0, bottom: 20 }}
                        scale={{ x: 'time' }}
                        domain={{
                            x: [new Date(timerange[0]), new Date(timerange[1])],
                            y: [1, 3],
                        }}
                        containerComponent={
                            <VictoryZoomContainer
                                responsive={false}
                                zoomDimension="x"
                                zoomDomain={this.state.zoomDomain}
                                onZoomDomainChange={this.handleZoom.bind(this)}
                            />
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
                            x={d => getTrackItemOrder(d.taskName)}
                            y={d => new Date(d.beginDate)}
                            y0={d => new Date(d.endDate)}
                            data={timelineData}
                        />
                    </VictoryChart>
                </MainChart>
                <BrushChart>
                    <VictoryChart
                        theme={chartTheme}
                        height={50}
                        width={chartWidth}
                        domainPadding={{ x: 35, y: 10 }}
                        padding={{ left: 50, top: 0, bottom: 20 }}
                        scale={{ x: 'time' }}
                        domain={{
                            x: [new Date(timerange[0]), new Date(timerange[1])],
                            y: [1, 3],
                        }}
                        containerComponent={
                            <VictoryBrushContainer
                                responsive={false}
                                brushDimension="x"
                                brushDomain={this.state.selectedDomain}
                                onBrushDomainChange={this.handleBrush.bind(this)}
                            />
                        }
                    >
                        <VictoryAxis />

                        <VictoryBar
                            horizontal={true}
                            style={{
                                data: {
                                    width: barWidth / 2,
                                    fill: d => d.color,
                                    stroke: d => d.color,
                                    strokeWidth: 0.5,
                                    fillOpacity: 0.75,
                                },
                            }}
                            x={d => getTrackItemOrder(d.taskName)}
                            y={d => new Date(d.beginDate)}
                            y0={d => new Date(d.endDate)}
                            data={timelineData}
                        />
                    </VictoryChart>
                </BrushChart>
            </div>
        );
    }
}

export const Timeline = TimelineComp;
