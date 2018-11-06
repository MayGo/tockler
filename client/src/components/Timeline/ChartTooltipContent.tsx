import React, { Component } from 'react';

export const ChartTooltipContent = ({ data }) => {
    if (!data) {
        console.log('No data for tooltip');
        return null;
    }

    return <div>Tooltip</div>;
};
