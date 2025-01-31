import { VictoryTooltip } from 'victory';
import { gray900 } from '../Timeline/ChartTheme';
import { PureComponent } from 'react';

interface IProps {
    text?: string;
    width: number;
    innerWidth: number;
    color?: string;
    datum?: any;
    theme: any;
}

export class PieLabel extends PureComponent<IProps> {
    public static defaultEvents = VictoryTooltip.defaultEvents;

    public render() {
        const { width, innerWidth, theme } = this.props;

        return (
            <g>
                <VictoryTooltip
                    {...this.props}
                    x={width / 2}
                    y={width / 2 + innerWidth / 2}
                    text={`${this.props.text}`}
                    orientation="top"
                    pointerLength={0}
                    cornerRadius={innerWidth / 2}
                    flyoutWidth={innerWidth}
                    flyoutHeight={innerWidth}
                    style={{ ...theme.tooltip.style, fontSize: 26 }}
                    flyoutStyle={{
                        fill: theme.isDark ? gray900 : 'white',
                        strokeWidth: 0,
                        fillOpacity: 1,
                    }}
                />
            </g>
        );
    }
}
