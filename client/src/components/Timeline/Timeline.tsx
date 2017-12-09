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
    series: any;
    timerange: any;
    changeTimerange: (timerange: any) => void;
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

class Timeline extends React.Component<IFullProps, IProps> {
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
        const { classes, series, timerange }: IFullProps = this.props;

        if (!series || !timerange) {
            return <div>No data</div>;
        }
        return (
            <div className={classes.root}>
                <Resizable>
                    <ChartContainer
                        timeRange={timerange}
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
