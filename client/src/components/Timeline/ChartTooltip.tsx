import React from 'react';
import { VictoryTooltip } from 'victory';
import { Portal } from 'react-portal';
import { Heading } from '../PieCharts/PieCharts.styles';

/* Tooltip */
export class ChartTooltip extends React.Component<any, any> {
    static defaultEvents = VictoryTooltip.defaultEvents;

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
        console.log('leave');
    };

    calcTooltipPosition = (node, x, y) => {
        if (node && this.state.x !== x) {
            this.setState({
                x: x,
                y: y,
                position: node.getBoundingClientRect(),
            });
        }
    };

    render() {
        const {
            x,
            y,
            datum,
            offsetX,
            horizontal,
            manualPosition,
            padding,
            width,
            height,
            ref,
        } = this.props;
        // console.error(this.props, this.props.scale.x(datum));
        const transform = offsetX ? `translate(${offsetX})` : '';
        var xTop = horizontal && padding ? (width + padding.left) / 2 : x;
        var yTop = y;
        // console.error('render tooltip', xTop, yTop);
        return (
            <g onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                <rect width={10} height={10} ref={node => this.calcTooltipPosition(node, x, y)} />

                {this.state.hover && (
                    <Portal closeOnEsc closeOnOutsideClick>
                        <div
                            style={{
                                position: 'fixed',
                                left: this.state.position.left,
                                top: this.state.position.top,
                            }}
                        >
                            Content
                        </div>
                    </Portal>
                )}
            </g>
        );
    }
}
