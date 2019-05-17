import React from 'react';
import { VictoryTooltip, Bar } from 'victory';
import { Portal } from 'react-portal';
import { chartTheme } from './ChartTheme';

export class BarWithTooltip extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = { position: true, hover: false };
    }

    onMouseEnterHandler = () => {
        this.setState({
            hover: true,
        });
    };
    onMouseLeaveHandler = () => {
        this.setState({
            hover: false,
        });
    };

    render() {
        const { datum } = this.props;

        const events = {
            onMouseEnter: this.onMouseEnterHandler,
            onMouseLeave: this.onMouseLeaveHandler,
            onClick: () => this.props.onClickBarItem(datum),
        };

        return (
            <>
                {<Bar {...this.props} events={events} />}
                {this.state.hover && (
                    <Portal closeOnEsc closeOnOutsideClick>
                        <VictoryTooltip
                            horizontal={false}
                            x={this.props.x}
                            y={this.props.y}
                            style={chartTheme.tooltip.style}
                            cornerRadius={chartTheme.tooltip.cornerRadius}
                            pointerLength={chartTheme.tooltip.pointerLength}
                            flyoutStyle={chartTheme.tooltip.flyoutStyle}
                            active={true}
                            events={null}
                            text={this.props.getTooltipLabel(this.props.datum)}
                        />
                    </Portal>
                )}
            </>
        );
    }
}
