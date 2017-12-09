import * as React from 'react';

import { withStyles } from 'material-ui/styles';
import { StyleRulesCallback } from 'material-ui/styles/withStyles';
import { injectIntl } from 'react-intl';
import * as ReactIntl from 'react-intl';
import { compose } from 'recompose';
import {
    Charts,
    ChartContainer,
    ChartRow,
    EventChart,
    Resizable
} from 'react-timeseries-charts';
import { TimeSeries, TimeRangeEvent, TimeRange } from 'pondjs';

const styles: StyleRulesCallback = theme => ({
    root: {
        minHeight: '100vh',
        margin: 10,
        backgroundColor: theme.palette.background.contentFrame
    },
    logo: {
        fontWeight: 200,
        letterSpacing: 1,
        flex: 1
    },
    summary: {
        display: 'flex'
    },
    grid: {
        padding: 10
    },
    toolbar: {
        minHeight: 48
    }
});

interface IProps {
    timerange: any;
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

const outageEvents = [
    {
        id: 472,
        taskName: 'AppTrackItem',
        beginDate: '2017-12-08T07:15:49.792Z',
        endDate: '2017-12-08T07:15:52.792Z',
        app: 'Code',
        title: 'ITrackItem.ts — tockler',
        color: '#000000'
    },
    {
        id: 472,
        taskName: 'AppTrackItem',
        beginDate: '2017-12-08T07:25:52.792Z',
        endDate: '2017-12-08T09:00:52.792Z',
        app: 'Code',
        title: 'ITrackItem.ts — tockler',
        color: '#fcd1c7'
    }
];

//
// Turn data into TimeSeries
//

const events = outageEvents.map(
    ({ beginDate, endDate, ...data }) =>
        new TimeRangeEvent(
            new TimeRange(new Date(beginDate), new Date(endDate)),
            data
        )
);
const series = new TimeSeries({ name: 'outages', events });

class Timeline extends React.Component<IFullProps, IProps> {
    constructor(props: any) {
        super(props);
        this.state = this.getInitialState();
        this.handleTrackerChanged = this.handleTrackerChanged.bind(this);
        this.handleTimeRangeChange = this.handleTimeRangeChange.bind(this);
    }
    getInitialState() {
        return {
            tracker: null,
            timerange: series.timerange()
        };
    }
    handleTrackerChanged(tracker: any) {
        this.setState({ tracker });
    }
    handleTimeRangeChange(timerange: any) {
        this.setState({ timerange });
    }
    render() {
        const { classes }: IFullProps = this.props;
        return (
            <div className={classes.root}>
                <Resizable>
                    <ChartContainer
                        timeRange={this.state.timerange}
                        enablePanZoom={true}
                        onTimeRangeChanged={this.handleTimeRangeChange}
                    >
                        <ChartRow height="30">
                            <Charts>
                                <EventChart
                                    series={series}
                                    size={45}
                                    style={(event: any) => ({
                                        fill: event.get('color')
                                    })}
                                    label={(e: any) => e.get('title')}
                                />
                            </Charts>
                        </ChartRow>
                    </ChartContainer>
                </Resizable>
            </div>
        );
    }
}

export default compose<IFullProps, IProps>(
    injectIntl,
    withStyles(styles, { name: 'Home' })
)(Timeline);
