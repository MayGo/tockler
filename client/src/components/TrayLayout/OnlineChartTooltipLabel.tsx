import { DateTime } from 'luxon';
import { PureComponent } from 'react';
import { VictoryTooltip } from 'victory';
import { shortTime } from '../../time.util';
import { formatToTime } from '../LineCharts/LineChart.util';
import { gray900 } from '../Timeline/ChartTheme';

interface IProps {
    text?: string;
    width: number;
    innerWidth: number;
    color?: string;
    datum?: { beginDate: number; endDate: number; diff: number };
    theme: { tooltip: { style: { fontSize: number } }; isDark: boolean };
}

interface StyledLabelProps {
    datum?: Record<string, unknown>;
    text?: string;
    theme?: { isDark: boolean };
    x?: number;
    y?: number;
    [key: string]: unknown;
}

// Custom label component for rich text formatting
class StyledLabel extends PureComponent<StyledLabelProps> {
    render() {
        const { datum, text, theme, x = 0, y = 0 } = this.props;

        if (!text || !datum) {
            return null;
        }

        const { beginDate, endDate, diff } = datum as { beginDate: number; endDate: number; diff: number };
        const now = DateTime.now();
        const end = DateTime.fromMillis(endDate);
        const timeAgoMs = now.diff(end).milliseconds;
        const timeAgo = shortTime(timeAgoMs, { largest: 2 });
        const timeText = `${formatToTime(beginDate)} - ${formatToTime(endDate)}`;
        const diffText = shortTime(diff * 1000 * 60);
        const timeAgoLabel = `${timeAgo} ago`;

        // Set colors based on theme
        const textColor = theme?.isDark ? 'white' : 'black';
        const blueColor = 'var(--chakra-colors-blue-500)';

        return (
            <g transform={`translate(${x}, ${y})`}>
                {/* First line - large and bold */}
                <text x={0} y={-40} textAnchor="middle" fill={blueColor} fontSize={26}>
                    {diffText}
                </text>

                {/* Second line - smaller */}
                <text x={0} y={10} textAnchor="middle" fill={textColor} fontSize={30}>
                    {timeText}
                </text>

                {/* Third line - smaller and lighter */}
                <text x={0} y={50} textAnchor="middle" fill={textColor} fontSize={14} opacity={0.7}>
                    {timeAgoLabel}
                </text>
            </g>
        );
    }
}

export class OnlineChartTooltipLabel extends PureComponent<IProps> {
    public static defaultEvents = VictoryTooltip.defaultEvents;

    public render() {
        const { width, innerWidth, theme } = this.props;

        return (
            <g>
                <VictoryTooltip
                    {...this.props}
                    x={width / 2}
                    y={width / 2 + innerWidth / 2}
                    labelComponent={<StyledLabel theme={theme} />}
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
