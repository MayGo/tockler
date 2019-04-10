import * as React from 'react';
import { Bar } from 'victory-bar/es';
import * as _ from 'lodash';

export class CustomBar extends React.Component<any, any> {
    shouldComponentUpdate(nextProps) {
        return !_.isEqual(this.props.datum, nextProps.datum);
    }
    render() {
        return <Bar {...this.props} />;
    }
}
