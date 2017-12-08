import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import Timeline from '../../components/Timeline/Timeline';

const TimelineContainer = () => <Timeline />;

export default compose<{}, {}>(connect(undefined, undefined), withRouter)(
    TimelineContainer
);
