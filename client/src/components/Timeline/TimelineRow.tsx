// NOT USED
import * as React from 'react';
import { Charts, ChartRow, EventChart } from 'react-timeseries-charts';

interface IProps {
    series: any;
}

export const TimelineRow = ({ series }: IProps) => (
    <ChartRow height="30">
        <Charts>
            <EventChart
                series={series}
                size={55}
                style={(event: any) => ({
                    fill: event.get('color'),
                })}
                label={(e: any) => e.get('title')}
            />
        </Charts>
    </ChartRow>
);
