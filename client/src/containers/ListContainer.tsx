import * as React from 'react';
import { withRouter } from 'react-router';
import TrackItemList from '../components/TrackItemList/TrackItemListContainer';

const ListContainer = () => <TrackItemList />;

export default withRouter(ListContainer);
