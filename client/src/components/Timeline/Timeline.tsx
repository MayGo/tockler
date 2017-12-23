import * as React from 'react';

import { withStyles } from 'material-ui/styles';
import { StyleRulesCallback } from 'material-ui/styles/withStyles';

import { ChartContainer, Resizable, Charts, ChartRow, EventChart } from 'react-timeseries-charts';

const styles: StyleRulesCallback = theme => ({
    root: {
        margin: 10,
        backgroundColor: theme.palette.background.contentFrame,
    },
    logo: {
        fontWeight: 200,
        letterSpacing: 1,
        flex: 1,
    },
    summary: {
        display: 'flex',
    },
    grid: {
        padding: 10,
    },
    toolbar: {
        minHeight: 48,
    },
});

interface IProps {
    timerange: any;
    appTrackItems: any;
    statusTrackItems: any;
    changeTimerange?: any;
    tracker?: any;
}

interface IHocProps {
    classes: {
        root: string;
        logo: string;
        grid: string;
        summary: string;
        toolbar: string;
    };
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
        this.props.changeTimerange(timerange);
    }
    render() {
        const { classes, timerange, appTrackItems, statusTrackItems }: IFullProps = this.props;

        if (!timerange) {
            return <div>No data</div>;
        }
        console.log('Have timerange', appTrackItems, statusTrackItems);
        return (
            <div className={classes.root}>
                <Resizable>
                    <ChartContainer
                        timeRange={timerange}
                        enablePanZoom={true}
                        onTimeRangeChanged={this.handleTimeRangeChange}
                    >
                        {createRow(appTrackItems)}
                        {createRow(statusTrackItems)}
                    </ChartContainer>
                </Resizable>
            </div>
        );
    }
}

export const Timeline = withStyles(styles, { name: 'Home' })(TimelineComp);
