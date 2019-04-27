import * as React from 'react';

import {
    VictoryChart,
    VictoryBrushContainer,
    VictoryBar,
    VictoryAxis,
    VictoryZoomContainer,
    VictoryTooltip,
} from 'victory';
import { Spin, Popover } from 'antd';
import moment from 'moment';
import 'moment-duration-format';
import debounce from 'lodash/debounce';
import { chartTheme, blueGrey700, disabledGrey } from './ChartTheme';
import { TrackItemType } from '../../enum/TrackItemType';
import { MainChart, BrushChart, Spinner } from './Timeline.styles';
import { TimelineRowType } from '../../enum/TimelineRowType';
import { TIME_FORMAT, INPUT_DATE_FORMAT, convertDate } from '../../constants';
import { SimpleBar } from './SimpleBar';
import { TimelineItemEditContainer } from './TimelineItemEditContainer';

interface IProps {
    timerange: any;
    visibleTimerange: any;
    appTrackItems: any;
    aggregatedAppItems: any;
    statusTrackItems: any;
    logTrackItems: any;
    changeVisibleTimerange?: any;
    selectTimelineItem?: any;
    toggleRow?: any;
    tracker?: any;
    selectedTimelineItem?: any;
    chartWidth?: number;
    loading?: boolean;
    isRowEnabled?: any;
}
interface IState {}

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

const getTrackItemOrderFn = d => getTrackItemOrder(d.taskName);
const contertDateForY = d => convertDate(d.beginDate);
const contertDateForY0 = d => convertDate(d.endDate);
const brushStyle = {
    data: {
        width: 7,
        fill: d => d.color,
        stroke: d => d.color,
        strokeWidth: 0.5,
        fillOpacity: 0.75,
    },
};

const barWidth = 25;

const scale = { y: 'time', x: 'linear' };
const padding = { left: 50, top: 0, bottom: 20, right: 10 };
const domainPadding = { y: 35, x: 10 };
const domainPaddingBrush = { y: 35, x: 5 };

const barStyle = {
    data: {
        width: barWidth,
        fill: d => d.color,
        stroke: d => d.color,
        strokeWidth: 0.5,
        fillOpacity: 0.75,
    },
};

class TimelineComp extends React.PureComponent<IFullProps, IState> {
    handleSelectionChanged = item => {
        if (item) {
            console.log('Selected item:', item);
            this.props.selectTimelineItem(item);
        } else {
            console.error('No item selected');
        }
    };

    handleZoom = domain => {
        this.props.changeVisibleTimerange(domain.y);
    };

    handleBrush = domain => {
        console.log('Selected with brush:', domain.y);

        this.props.changeVisibleTimerange(domain.y);
    };
    calcRowEnabledColor = d => {
        return this.props.isRowEnabled[d] ? blueGrey700 : disabledGrey;
    };
    calcRowEnabledColorFlipped = d => {
        return !this.props.isRowEnabled[d] ? blueGrey700 : disabledGrey;
    };

    onTimelineTypeLabelClick = (item, props) => {
        console.error('onTimelineTypeLabelClick', item, props);
    };
    getBarLabel = d => {
        const diff = convertDate(d.endDate).diff(convertDate(d.beginDate));
        const dur = moment.duration(diff);
        let formattedDuration = dur.format();
        const type = d.taskName === TrackItemType.StatusTrackItem ? 'STATUS' : d.app;
        const beginTime = convertDate(d.beginDate).format(TIME_FORMAT);
        const endTime = convertDate(d.endDate).format(TIME_FORMAT);

        return `${type} - ${d.title} [${formattedDuration}] ${beginTime} - ${endTime}`;
    };

    render() {
        const {
            appTrackItems,
            logTrackItems,
            statusTrackItems,
            aggregatedAppItems,
            timerange,
            selectedTimelineItem,
            visibleTimerange,
            chartWidth,
            loading,
            isRowEnabled,
            toggleRow,
        }: IFullProps = this.props;

        if (!timerange && !appTrackItems && appTrackItems.length === 0) {
            return <div>No data</div>;
        }
        console.log('Have timerange and visibleTimerange', timerange, visibleTimerange);

        let timelineData = [];
        let brushData = [];
        if (isRowEnabled[TimelineRowType.Status]) {
            // console.log('Adding statusTrackItems:', statusTrackItems);
            timelineData = timelineData.concat(statusTrackItems);
            brushData = brushData.concat(statusTrackItems);
        }
        if (isRowEnabled[TimelineRowType.Log]) {
            // console.log('Adding logTrackItems:', logTrackItems);
            timelineData = timelineData.concat(logTrackItems);
            brushData = brushData.concat(logTrackItems);
        }
        if (isRowEnabled[TimelineRowType.App]) {
            // console.log('Adding apptrackItems:', appTrackItems);
            timelineData = timelineData.concat(appTrackItems);
        }
        // console.error('aggregatedAppItems', aggregatedAppItems);
        //    timelineData = timelineData.concat(aggregatedAppItems);
        console.log(`Rendering ${timelineData.length} items`);

        const axisEvents = [
            {
                target: 'tickLabels',
                eventHandlers: {
                    onClick: () => {
                        return [
                            {
                                target: 'tickLabels',
                                mutation: props => {
                                    console.log('Toggling row', props);
                                    toggleRow(props.datum);
                                    return {
                                        style: {
                                            ...props.style,
                                            fill: this.calcRowEnabledColorFlipped(props.datum),
                                        },
                                    };
                                },
                            },
                        ];
                    },
                },
            },
        ];

        const axisStyle = {
            grid: { strokeWidth: 0 },
            ticks: { stroke: 'grey', size: 5 },
            tickLabels: {
                fill: this.calcRowEnabledColor,
            },
        };

        const handleBrushDebounced = debounce(this.handleBrush, 300);

        const domain = {
            y: [convertDate(timerange[0]), convertDate(timerange[1])],
            x: [1, 3],
        };

        return (
            <div>
                <MainChart>
                    {loading && (
                        <Spinner>
                            <Spin />
                        </Spinner>
                    )}
                    <Popover
                        style={{ zIndex: 930 }}
                        content={<TimelineItemEditContainer showDeleteBtn showCloseBtn />}
                        visible={!!selectedTimelineItem}
                        trigger="click"
                    >
                        <VictoryChart
                            theme={chartTheme}
                            height={100}
                            width={chartWidth}
                            domainPadding={domainPadding}
                            padding={padding}
                            scale={scale}
                            horizontal={true}
                            domain={domain}
                            containerComponent={
                                <VictoryZoomContainer
                                    responsive={false}
                                    zoomDimension="y"
                                    zoomDomain={{ y: visibleTimerange }}
                                    onZoomDomainChange={debounce(this.handleZoom, 300)}
                                />
                            }
                        >
                            <VictoryAxis
                                tickValues={[1, 2, 3]}
                                tickFormat={['App', 'Status', 'Log']}
                                events={axisEvents}
                                style={axisStyle}
                            />
                            <VictoryAxis dependentAxis={true} tickCount={20} />

                            <VictoryBar
                                style={barStyle}
                                x={getTrackItemOrderFn}
                                y={contertDateForY}
                                y0={contertDateForY0}
                                data={timelineData}
                                dataComponent={
                                    <SimpleBar
                                        getBarLabel={this.getBarLabel}
                                        onClickBarItem={this.handleSelectionChanged}
                                    />
                                }
                            />
                        </VictoryChart>
                    </Popover>
                </MainChart>
                <BrushChart>
                    <VictoryChart
                        theme={chartTheme}
                        height={50}
                        width={chartWidth}
                        domainPadding={domainPaddingBrush}
                        padding={padding}
                        horizontal={true}
                        scale={scale}
                        domain={domain}
                        containerComponent={
                            <VictoryBrushContainer
                                responsive={false}
                                brushDimension="y"
                                brushDomain={{ y: visibleTimerange }}
                                onBrushDomainChange={handleBrushDebounced}
                            />
                        }
                    >
                        <VictoryAxis dependentAxis={true} tickCount={20} />

                        <VictoryBar
                            animate={false}
                            style={brushStyle}
                            x={getTrackItemOrderFn}
                            y={contertDateForY}
                            y0={contertDateForY0}
                            data={brushData}
                        />
                    </VictoryChart>
                </BrushChart>
            </div>
        );
    }
}

export const Timeline = TimelineComp;
