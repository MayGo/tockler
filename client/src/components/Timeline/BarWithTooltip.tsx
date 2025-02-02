import { useRef, useState } from 'react';
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
    centerTime?: boolean;
}

const calculateMiddle = (datum) => {
    return datum.beginDate + (datum.endDate - datum.beginDate) / 2;
};

export const BarWithTooltip = ({
    datum = {},
    onClickBarItem,
    getTooltipLabel,
    popoverTriggerRef = null,
    x = 0,
    y = 0,
    theme,
    centerTime = false,
    ...rest
}: PropsI) => {
    const barRef = useRef(null);
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
                // eslint-disable-next-line react-compiler/react-compiler
                popoverTriggerRef.current = barRef.current;
                onClickBarItem(datum);
            }
        },
    };

    const midpoint = calculateMiddle(datum);
    // @ts-ignore
    const newX = rest.scale.y(midpoint);

    return (
        <>
            {<Bar datum={datum} x={x} y={y} {...rest} events={events} />}

            {hover && (
                <Portal closeOnEsc closeOnOutsideClick>
                    <VictoryTooltip
                        horizontal={false}
                        x={centerTime ? newX : x}
                        y={y}
                        style={theme.tooltip.style}
                        cornerRadius={theme.tooltip.cornerRadius}
                        pointerLength={theme.tooltip.pointerLength}
                        flyoutStyle={theme.tooltip.flyoutStyle}
                        active
                        events={{}}
                        text={getTooltipLabel(datum)}
                        datum={datum}
                    />
                </Portal>
            )}
        </>
    );
};
