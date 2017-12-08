import * as React from 'react';

import { withStyles } from 'material-ui/styles';
import { StyleRulesCallback } from 'material-ui/styles/withStyles';
import { injectIntl } from 'react-intl';
import * as ReactIntl from 'react-intl';
import { compose } from 'recompose';

const styles: StyleRulesCallback = theme => ({
    root: {
        minHeight: '100vh',
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

interface IProps {}

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

const Home = ({ classes, intl }: IFullProps) => (
    <div className={classes.root}>tim</div>
);

export default compose<IFullProps, IProps>(
    injectIntl,
    withStyles(styles, { name: 'Home' })
)(Home);
