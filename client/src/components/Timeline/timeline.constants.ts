import { D3Scale, Padding, ScalePropType } from 'victory';

export const BAR_WIDTH = 25;

export const CHART_PADDING: Padding = { left: 0, top: 0, bottom: 20, right: 10 };

export const CHART_SCALE: {
    x?: ScalePropType | D3Scale;
    y?: ScalePropType | D3Scale;
} = { y: 'time', x: 'linear' };
