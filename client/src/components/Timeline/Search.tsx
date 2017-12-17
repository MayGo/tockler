import * as React from 'react';

import { withStyles } from 'material-ui/styles';
import { StyleRulesCallback } from 'material-ui/styles/withStyles';
import { injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { DateTimePicker } from 'material-ui-pickers';

const styles: StyleRulesCallback = theme => ({
    root: {
        margin: 10,
        backgroundColor: theme.palette.background.contentFrame,
    },
});

interface IProps {
    selectedDateTime: any;
    handleDateTimeChange?: any;
}

interface IHocProps {
    classes: {
        root: string;
    };
    intl: ReactIntl.InjectedIntl;
}

type IFullProps = IProps & IHocProps;

class SearchComp extends React.Component<IFullProps, IProps> {
    state = {
        selectedDateTime: new Date(),
    };
    constructor(props: any) {
        super(props);

        this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    }

    handleDateTimeChange = (dateTime: any) => {
        this.setState({ selectedDateTime: dateTime });
    };
    render() {
        const { classes, selectedDateTime } = this.props;

        console.log('Have timerange');
        return (
            <div className={classes.root}>
                <DateTimePicker value={selectedDateTime} onChange={this.handleDateTimeChange} />
            </div>
        );
    }
}

export const Search = compose<IFullProps, IProps>(injectIntl, withStyles(styles, { name: 'Home' }))(
    SearchComp
);
