import PropTypes from 'prop-types';
import React from 'react';

import { Portal } from 'react-portal';
import { VictoryBar, Flyout } from 'victory';
import { chartTheme } from './ChartTheme';
export class ChartBar extends React.PureComponent<any, any> {
    constructor(props) {
        super(props);
        this.state = { position: true, hover: false };
    }

    onMouseEnterHandler = () => {
        this.setState({
            hover: true,
        });
        console.error('enter');
    };
    onMouseLeaveHandler = () => {
        this.setState({
            hover: false,
        });
    };
    render() {
        console.error('chartbar props', this.props);
        return (
            <g onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                <VictoryBar {...this.props} />
                <Portal closeOnEsc closeOnOutsideClick>
                    <div
                        style={{
                            position: 'fixed',
                            left: 100,
                            right: 100,
                        }}
                    >
                        Conteantasdasdasdasdsadasdasdas dasd a sd
                    </div>
                </Portal>
            </g>
        );
    }
}
