import React, { useRef, useState } from 'react';
import { Portal } from 'react-portal';
import { Bar, VictoryTooltip } from 'victory';

export const BarWithTooltip = ({
    datum = {},
    onClickBarItem,
    getTooltipLabel,
    popoverTriggerRef,
    x = 0,
    y = 0,
    theme,
    ...rest
}) => {
    const barRef = useRef();
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
        onClick: () => {
            // Todo: Find a way to get barRef from Bar
            console.info('barRef.current', barRef.current);
            popoverTriggerRef.current = barRef.current;

            onClickBarItem(datum);
        },
    };

    return (
        <>
            {<Bar datum={datum} x={x} y={y} {...rest} events={events} />}
            {hover && (
                <Portal closeOnEsc closeOnOutsideClick>
                    <VictoryTooltip
                        horizontal={false}
                        x={x}
                        y={y}
                        style={theme.tooltip.style}
                        cornerRadius={theme.tooltip.cornerRadius}
                        pointerLength={theme.tooltip.pointerLength}
                        flyoutStyle={theme.tooltip.flyoutStyle}
                        active
                        events={{}}
                        text={getTooltipLabel(datum)}
                    />
                </Portal>
            )}
        </>
    );
};
