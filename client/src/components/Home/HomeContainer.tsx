import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import Home from '../../components/Home/Home';

const HomeContainer = () => <Home />;

export default compose<{}, {}>(connect(undefined, undefined), withRouter)(
    HomeContainer
);
