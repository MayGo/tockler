import { assign } from 'lodash';

// *
// * Colors
// *
const yellow200 = '#FFF59D';
const deepOrange600 = '#F4511E';
const lime300 = '#DCE775';
const lightGreen500 = '#8BC34A';
const teal700 = '#00796B';
const cyan900 = '#006064';
const colors = [deepOrange600, yellow200, lime300, lightGreen500, teal700, cyan900];

const bluegray300 = 'var(--chakra-colors-gray-300)';

export const bluegray700 = 'var(--chakra-colors-gray-700)';
export const gray900 = 'var(--chakra-colors-gray-900)';
export const disabledgray = 'var(--chakra-colors-gray-300)';
const almostWhite = 'var(--chakra-colors-gray-100)';
const gray = 'var(--chakra-colors-gray-500)';

export const getLabelColor = (isDark, isEnabled) => {
    if (isDark) {
        return isEnabled ? almostWhite : bluegray700;
    }

    return !isEnabled ? disabledgray : disabledgray;
};
// *
// * Typography
// *
const sansSerif = "'Roboto', 'Helvetica Neue', Helvetica, sans-serif";
const letterSpacing = 'normal';
const fontSize = 12;
// *
// * Layout
// *
const padding = 2;
const baseProps = {
    width: 350,
    height: 350,
    padding: 50,
};
// *
// * Labels
// *
const baseLabelStyles = isDark => ({
    fontFamily: sansSerif,
    fontSize,
    letterSpacing,
    padding,
    fill: isDark ? almostWhite : bluegray700,
    stroke: 'transparent',
    strokeWidth: 0,
});

const centeredLabelStyles = isDark => assign({ textAnchor: 'middle' }, baseLabelStyles(isDark));
// *
// * Strokes
// *

export const getChartTheme = isDark => ({
    isDark,
    chart: baseProps,

    axis: assign(
        {
            style: {
                axis: {
                    fill: 'transparent',
                    strokeWidth: 0,
                },
                axisLabel: assign({}, centeredLabelStyles(isDark), {
                    padding,
                    stroke: 'transparent',
                }),
                grid: {
                    stroke: isDark ? gray : bluegray300,
                    pointerEvents: 'painted',
                },
                ticks: {
                    fill: 'transparent',
                    size: 5,
                    strokeWidth: 0,
                },
                tickLabels: assign({}, baseLabelStyles(isDark), {
                    fill: isDark ? almostWhite : bluegray700,
                }),
            },
        },
        baseProps,
    ),
    bar: assign(
        {
            style: {
                data: {
                    fill: isDark ? almostWhite : bluegray700,
                    padding,
                    strokeWidth: 0,
                },
                labels: baseLabelStyles(isDark),
            },
        },
        baseProps,
    ),

    tooltip: {
        style: assign({}, centeredLabelStyles(isDark), {
            padding: 15,
            pointerEvents: 'none',
        }),
        flyoutStyle: {
            stroke: isDark ? almostWhite : bluegray300,
            strokeWidth: 0.5,
            fill: isDark ? '#000000' : '#ffffff',
            pointerEvents: 'none',
        },
        cornerRadius: 3,
        pointerLength: 5,
    },

    pie: assign(
        {
            colorScale: colors,
            style: {
                data: {
                    padding,
                    stroke: bluegray300,
                    strokeWidth: 1,
                },
                labels: assign({}, baseLabelStyles(isDark), { padding: 20 }),
            },
        },
        baseProps,
    ),

    area: assign(
        {
            style: {
                data: {
                    fill: gray900,
                },
                labels: centeredLabelStyles(isDark),
            },
        },
        baseProps,
    ),
    boxplot: assign(
        {
            style: {
                max: { padding, stroke: bluegray700, strokeWidth: 1 },
                maxLabels: baseLabelStyles(isDark),
                median: { padding, stroke: bluegray700, strokeWidth: 1 },
                medianLabels: baseLabelStyles(isDark),
                min: { padding, stroke: bluegray700, strokeWidth: 1 },
                minLabels: baseLabelStyles(isDark),
                q1: { padding, fill: bluegray700 },
                q1Labels: baseLabelStyles(isDark),
                q3: { padding, fill: bluegray700 },
                q3Labels: baseLabelStyles(isDark),
            },
            boxWidth: 20,
        },
        baseProps,
    ),
    candlestick: assign(
        {
            style: {
                data: {
                    stroke: bluegray700,
                },
                labels: centeredLabelStyles(isDark),
            },
            candleColors: {
                positive: '#ffffff',
                negative: bluegray700,
            },
        },
        baseProps,
    ),

    errorbar: assign(
        {
            borderWidth: 8,
            style: {
                data: {
                    fill: 'transparent',
                    opacity: 1,
                    stroke: bluegray700,
                    strokeWidth: 2,
                },
                labels: centeredLabelStyles(isDark),
            },
        },
        baseProps,
    ),
    group: assign(
        {
            colorScale: colors,
        },
        baseProps,
    ),
    legend: {
        colorScale: colors,
        gutter: 10,
        orientation: 'vertical',
        titleOrientation: 'top',
        style: {
            data: {
                type: 'circle',
            },
            labels: baseLabelStyles(isDark),
            title: assign({}, baseLabelStyles(isDark), { padding: 5 }),
        },
    },
    line: assign(
        {
            style: {
                data: {
                    fill: 'transparent',
                    opacity: 1,
                    stroke: bluegray700,
                    strokeWidth: 2,
                },
                labels: centeredLabelStyles(isDark),
            },
        },
        baseProps,
    ),

    scatter: assign(
        {
            style: {
                data: {
                    fill: bluegray700,
                    opacity: 1,
                    stroke: 'transparent',
                    strokeWidth: 0,
                },
                labels: centeredLabelStyles(isDark),
            },
        },
        baseProps,
    ),
    stack: assign(
        {
            colorScale: colors,
        },
        baseProps,
    ),

    voronoi: assign(
        {
            style: {
                data: {
                    fill: 'transparent',
                    stroke: 'transparent',
                    strokeWidth: 0,
                },
                labels: assign({}, centeredLabelStyles(isDark), {
                    padding: 5,
                    pointerEvents: 'none',
                }),
                flyout: {
                    stroke: gray900,
                    strokeWidth: 1,
                    fill: '#f0f0f0',
                    pointerEvents: 'none',
                },
            },
        },
        baseProps,
    ),
});
