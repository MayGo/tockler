import React from 'react';
import { VictoryTooltip } from 'victory';

interface IProps {
    text?: string;
    width: number;
    color?: string;
    datum?: any;
}

export class PieLabel extends React.PureComponent<IProps> {
    public static defaultEvents = VictoryTooltip.defaultEvents;

    public render() {
        const { width, datum } = this.props;

        const labelWidth = width / 2;

        return (
            <g>
                <VictoryTooltip
                    {...this.props}
                    x={width / 2}
                    y={width / 2 + labelWidth / 2}
                    text={`${this.props.text}`}
                    orientation="top"
                    pointerLength={0}
                    cornerRadius={labelWidth / 2}
                    flyoutWidth={labelWidth}
                    flyoutHeight={labelWidth}
                    flyoutStyle={{
                        fill: datum.color,
                        stroke: 'white',
                        strokeWidth: 1,
                        fillOpacity: 0.35,
                    }}
                />
            </g>
        );
    }
}
