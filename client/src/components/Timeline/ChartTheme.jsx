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
const blueGrey50 = '#ECEFF1';
const blueGrey300 = '#90A4AE';

export const blueGrey700 = '#455A64';
export const grey900 = '#212121';
export const disabledGrey = '#e6e6e6';

export const getLabelColor = (isDark, isEnabled) => {
    if (isDark) {
        return isEnabled ? almostWhite : blueGrey700;
    }

    return !isEnabled ? disabledGrey : disabledGrey;
};
// *
// * Typography
// *
const sansSerif = "'Roboto', 'Helvetica Neue', Helvetica, sans-serif";
const letterSpacing = 'normal';
const fontSize = 10;
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
    fill: isDark ? almostWhite : blueGrey700,
    stroke: 'transparent',
    strokeWidth: 0,
});

const almostWhite = '#c3c3c3';
const lightGray = '#151515';
const gray = '#212121';

const centeredLabelStyles = isDark => assign({ textAnchor: 'middle' }, baseLabelStyles(isDark));
// *
// * Strokes
// *
const strokeDasharray = '10, 5';
const strokeLinecap = 'round';
const strokeLinejoin = 'round';

export const getChartTheme = isDark => ({
    isDark,
    chart: baseProps,

    axis: assign(
        {
            style: {
                axis: {
                    fill: 'transparent',
                    stroke: isDark ? gray : blueGrey300,
                    strokeWidth: 1,
                    strokeLinecap,
                    strokeLinejoin,
                },
                axisLabel: assign({}, centeredLabelStyles(isDark), {
                    padding,
                    stroke: 'transparent',
                }),
                grid: {
                    fill: 'none',
                    stroke: isDark ? lightGray : blueGrey50,
                    strokeDasharray,
                    strokeLinecap,
                    strokeLinejoin,
                    pointerEvents: 'painted',
                },
                ticks: {
                    fill: 'transparent',
                    size: 5,
                    stroke: isDark ? gray : blueGrey300,
                    strokeWidth: 1,
                    strokeLinecap,
                    strokeLinejoin,
                },
                tickLabels: assign({}, baseLabelStyles(isDark), {
                    fill: isDark ? almostWhite : blueGrey700,
                }),
            },
        },
        baseProps,
    ),
    bar: assign(
        {
            style: {
                data: {
                    fill: isDark ? almostWhite : blueGrey700,
                    padding,
                    strokeWidth: 0,
                },
                labels: baseLabelStyles(isDark),
            },
        },
        baseProps,
    ),

    tooltip: {
        style: assign({}, centeredLabelStyles(isDark), { padding: 5, pointerEvents: 'none' }),
        flyoutStyle: {
            stroke: isDark ? almostWhite : blueGrey300,
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
                    stroke: blueGrey50,
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
                    fill: grey900,
                },
                labels: centeredLabelStyles(isDark),
            },
        },
        baseProps,
    ),
    boxplot: assign(
        {
            style: {
                max: { padding, stroke: blueGrey700, strokeWidth: 1 },
                maxLabels: baseLabelStyles(isDark),
                median: { padding, stroke: blueGrey700, strokeWidth: 1 },
                medianLabels: baseLabelStyles(isDark),
                min: { padding, stroke: blueGrey700, strokeWidth: 1 },
                minLabels: baseLabelStyles(isDark),
                q1: { padding, fill: blueGrey700 },
                q1Labels: baseLabelStyles(isDark),
                q3: { padding, fill: blueGrey700 },
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
                    stroke: blueGrey700,
                },
                labels: centeredLabelStyles(isDark),
            },
            candleColors: {
                positive: '#ffffff',
                negative: blueGrey700,
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
                    stroke: blueGrey700,
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
                    stroke: blueGrey700,
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
                    fill: blueGrey700,
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
                    stroke: grey900,
                    strokeWidth: 1,
                    fill: '#f0f0f0',
                    pointerEvents: 'none',
                },
            },
        },
        baseProps,
    ),
});
