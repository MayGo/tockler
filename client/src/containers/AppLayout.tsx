import * as React from 'react';

import Button from 'material-ui/Button';
import AppBar from 'material-ui/AppBar';

import { Typography, Toolbar } from 'material-ui';

import { withStyles } from 'material-ui/styles';
import { StyleRulesCallback } from 'material-ui/styles/withStyles';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router';
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

const AppLayout = ({
    children,
    classes,
    gotoList
}: {
    children?: any;
    classes?: any;
    gotoList?: any;
}) => {
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <Typography
                        type="title"
                        color="inherit"
                        className={classes.logo}
                    >
                        Tockler
                    </Typography>

                    <Button color="contrast" onClick={gotoList}>
                        List
                    </Button>
                </Toolbar>
            </AppBar>
            {children}
        </div>
    );
};
/*
export default withRouter(
    connect(null, dispatch => ({
        gotoList: () => {
            console.log('goto list');
            dispatch(push('/list'));
        }
    }))(withStyles(styles, { name: 'AppLayout' })(AppLayout))
);*/
export default compose(
    withRouter,
    withStyles(styles, { name: 'AppLayout' }),
    connect(null, dispatch => ({
        gotoList: () => {
            console.log('goto list');
            dispatch(push('/list'));
        }
    }))
)(AppLayout);
