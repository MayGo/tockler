import React, { Component } from 'react';
import { VictoryTooltip } from 'victory';

import { chartTheme } from './ChartTheme';

export const customEvents = [
    {
        target: 'data',
        eventHandlers: {
            onMouseOver: evt => ({
                target: 'labels',
                mutation: () => ({
                    active: true,
                    clientX: evt.clientX,
                    clientY: evt.clientY,
                }),
            }),
            onMouseOut: evt => ({
                target: 'labels',
                mutation: () => ({
                    active: false,
                    clientX: evt.clientX,
                    clientY: evt.clientY,
                }),
            }),
            onClick: evt => ({
                target: 'labels',
                mutation: () => ({
                    active: true,
                    clientX: evt.clientX,
                    clientY: evt.clientY,
                }),
            }),
        },
    },
];

export class ChartTooltip extends Component<any, any> {
    static defaultEvents = customEvents;

    shouldComponentUpdate(nextProps) {
        return this.props.active !== nextProps.active;
    }

    render() {
        const { content, datum, active, clientX, clientY } = this.props;
        const TooltipContent = content;

        if (!active) {
            return null;
        }

        console.debug('Tooltip opened with data:', datum);
        return (
            <VictoryTooltip
                {...this.props}
                horizontal={false}
                style={chartTheme.tooltip.style}
                cornerRadius={chartTheme.tooltip.cornerRadius}
                pointerLength={chartTheme.tooltip.pointerLength}
                flyoutStyle={chartTheme.tooltip.flyoutStyle}
            />
        );
    }
}
