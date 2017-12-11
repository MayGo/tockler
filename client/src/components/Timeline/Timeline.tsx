import * as React from 'react';

import { withStyles } from 'material-ui/styles';
import { StyleRulesCallback } from 'material-ui/styles/withStyles';
import { injectIntl } from 'react-intl';
import * as ReactIntl from 'react-intl';
import { compose } from 'recompose';
import { ChartContainer, Resizable } from 'react-timeseries-charts';
import { TimelineRowContainer } from './TimelineRowContainer';
import { TrackItemType } from '../../enum/TrackItemType';

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
        const { classes, timerange }: IFullProps = this.props;

        if (!timerange) {
            return <div>No data</div>;
        }
        console.log('Have timerange');
        return (
            <div className={classes.root}>
                <Resizable>
                    <ChartContainer
                        timeRange={timerange}
                        enablePanZoom={true}
                        onTimeRangeChanged={this.handleTimeRangeChange}
                    >
                        <TimelineRowContainer trackItemType={TrackItemType.AppTrackItem} />
                    </ChartContainer>
                </Resizable>
            </div>
        );
    }
}

export const Timeline = compose<IFullProps, IProps>(
    injectIntl,
    withStyles(styles, { name: 'Home' })
)(TimelineComp);
