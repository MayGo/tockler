import React, { useState } from 'react';
import { Portal } from 'react-portal';
import { VictoryBar, VictoryTooltip } from 'victory';
import { chartTheme } from './ChartTheme';

export const BarWithTooltip = ({
    datum = {},
    onClickBarItem,
    getTooltipLabel,
    x = 0,
    y = 0,
    ...rest
}) => {
    const [hover, setHover] = useState(false);

    const onMouseEnter = () => {
        setHover(true);
    };

    const onMouseLeave = () => {
        setHover(false);
    };

    const events = {
        onMouseEnter,
        onMouseLeave,
        onClick: () => onClickBarItem(datum),
    };

    return (
        <>
            {<VictoryBar x={x} y={y} {...rest} {...events} />}
            {hover && (
                <Portal closeOnEsc closeOnOutsideClick>
                    <VictoryTooltip
                        horizontal={false}
                        x={x}
                        y={y}
                        style={chartTheme.tooltip.style}
                        cornerRadius={chartTheme.tooltip.cornerRadius}
                        pointerLength={chartTheme.tooltip.pointerLength}
                        flyoutStyle={chartTheme.tooltip.flyoutStyle}
                        active
                        events={undefined}
                        text={getTooltipLabel(datum)}
                    />
                </Portal>
            )}
        </>
    );
};
