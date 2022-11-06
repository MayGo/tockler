import React, { useRef, useState } from 'react';
import { Portal } from 'react-portal';
import { Bar, VictoryTooltip } from 'victory';
interface PropsI {
    datum?: {};
    onClickBarItem?: any;
    getTooltipLabel: any;
    popoverTriggerRef?: any;
    x?: number;
    y?: number;
    theme: any;
}

export const BarWithTooltip = ({
    datum = {},
    onClickBarItem,
    getTooltipLabel,
    popoverTriggerRef = null,
    x = 0,
    y = 0,
    theme,
    ...rest
}: PropsI) => {
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

            if (onClickBarItem && popoverTriggerRef) {
                console.info('barRef.current', barRef.current);
                popoverTriggerRef.current = barRef.current;
                onClickBarItem(datum);
            }
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
